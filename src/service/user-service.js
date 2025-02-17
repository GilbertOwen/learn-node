import jwt from "jsonwebtoken";
import { prisma } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  registerUserValidationSchema,
  loginUserValidationSchema,
  updateUserValidationSchema,
} from "../validation/user-validation.js";
import { validate } from "../validation/validation.js";
import bcrypt from "bcrypt";
import fs from "fs";

// TODO : Commit all of the changes, implement it to likerest application

// Function to register a new user by accepting request body
const register = async (request) => {
  const user = validate(registerUserValidationSchema, request);

  user.password = bcrypt.hashSync(user.password, 10);

  const countUserUsername = await prisma.user.count({
    where: { username: user.username },
  });

  const countUserEmail = await prisma.user.count({
    where: { email: user.email },
  });

  if (countUserEmail > 0 && countUserUsername > 0) {
    throw new ResponseError(400, "Failed to register user's account", {
      username: "Username has already existed",
      email: "Email has already existed",
    });
  }

  if (countUserEmail > 0) {
    throw new ResponseError(400, "Failed to register user's account", {
      email: "Email has already existed",
    });
  }

  if (countUserUsername > 0) {
    throw new ResponseError(400, "Failed to register user's account", {
      username: "Username has already existed",
    });
  }

  return prisma.user.create({
    data: user,
    select: {
      username: true,
      email: true,
    },
  });
};

// Function to login a user by accepting request body
const login = async (request) => {
  const userCreds = validate(loginUserValidationSchema, request);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: userCreds.username }, { email: userCreds.username }],
    },
  });

  if (!user || !bcrypt.compareSync(userCreds.password, user.password)) {
    throw new ResponseError(401, "Invalid username or password");
  }

  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET environment variable is not set");
  }
  const expiresIn = 24 * 60 * 60; // in seconds
  const token = jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    process.env.TOKEN_SECRET,
    { expiresIn }
  );
  let tokenExpiryDate = new Date(Date.now() + expiresIn * 1000);
  try {
    await prisma.sessionToken.create({
      data: { token, tokenExpiry: tokenExpiryDate, userId: user.id },
    });
  } catch (err) {
    console.error("Failed to update user token:", err.message);
    throw new Error("Error updating user token");
  }

  return {
    token: {
      token,
      expiresIn: tokenExpiryDate,
    },
    user: {
      username: user.username,
      email: user.email,
    },
  };
};
const update = async (req) => {
  // Validate the request body (this will throw if validation fails)
  const userInputtedCreds = validate(updateUserValidationSchema, req.body);
  const user = req.session.user;
  let newUserCreds = {};

  // Handle password update
  if (userInputtedCreds.password) {
    if (!bcrypt.compareSync(userInputtedCreds.password, user.password)) {
      throw new ResponseError(400, "Invalid password", [
        { path: "password", message: "Invalid password" },
      ]);
    }
    newUserCreds.password = bcrypt.hashSync(userInputtedCreds.password, 10);
  }

  // Handle email update
  if (userInputtedCreds.email && userInputtedCreds.email !== user.email) {
    const countUser = await prisma.user.count({
      where: { email: userInputtedCreds.email },
    });
    if (countUser > 0) {
      throw new ResponseError(400, "Email has already existed", [
        { path: "email", message: "Email has already existed" },
      ]);
    }
    userInputtedCreds.email = userInputtedCreds.email.toLowerCase();
  }

  // Handle username update
  if (
    userInputtedCreds.username &&
    userInputtedCreds.username !== user.username
  ) {
    const countUser = await prisma.user.count({
      where: { username: userInputtedCreds.username },
    });
    if (countUser > 0) {
      throw new ResponseError(400, "Username has already existed", [
        { path: "username", message: "Username has already existed" },
      ]);
    }
    userInputtedCreds.username = userInputtedCreds.username.toLowerCase();
  }

  // Get the current imageUrl from DB
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { imageUrl: true },
  });

  let imageUrlPath = existingUser.imageUrl; // Default to old image

  if (req.file) {
    // New profile picture uploaded

    // Delete old profile image (if exists)
    if (existingUser.imageUrl && fs.existsSync(existingUser.imageUrl)) {
      fs.unlinkSync(existingUser.imageUrl); // Delete old image
    }

    // Update with new image
    imageUrlPath = req.file.path;
  }

  // Merge validated fields with the new image URL
  newUserCreds = { ...userInputtedCreds, imageUrl: imageUrlPath };

  // Update and return the updated user record
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: newUserCreds,
    select: {
      username: true,
      email: true,
      imageUrl: true,
    },
  });

  return updatedUser;
};



const me = async (user) => {
  if (!user) {
    throw new Error("User object is required");
  }
  let imageData = "";
  if (user.imageUrl) {
    try {
      // Read the file into a Buffer
      const buffer = fs.readFileSync(user.imageUrl);
      // Convert the buffer to a base64 string
      imageData = buffer.toString("base64");
      console.log("Terambil");
    } catch (err) {
      console.error("Error reading image file:", err);
      // Optionally, set imageData to a default value or leave it empty
      imageData = "";
    }
  }
  return {
    username: user.username,
    email: user.email,
    frontName: user.frontName,
    rearName: user.rearName?.length === 0 ? "" : user.rearName,
    imageData: imageData, // Use nullish coalescing for better handling
    biodata: user.biodata ?? "", // Use nullish coalescing for better handling
  };
};

const profile = async (req) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.userId),
      },
      include: {
        posts: true,
        saves: true,
      },
    });
    return {
      name: user.frontName + user.rearName,
      username: user.username,
      biodata: user.biodata,
      // posts : user
    };
  } catch (err) {
    return null;
  }
};

const logout = async (req) => {
  try {
    // Check the session id that has been attached to request params
    await prisma.sessionToken.delete({
      where: { token: req.session.token },
    });
  } catch (err) {
    throw new Error("Error updating user token");
  }
};

export default {
  register,
  login,
  update,
  me,
  logout,
  profile,
};
