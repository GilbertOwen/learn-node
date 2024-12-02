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

// TODO : Commit all of the changes, implement it to likerest application

// Function to register a new user by accepting request body
const register = async (request) => {
  const user = validate(registerUserValidationSchema, request);

  user.password = bcrypt.hashSync(user.password, 10);

  const countUser = await prisma.user.count({
    where: {
      OR: [{ username: user.username }, { email: user.email }],
    },
  });

  if (countUser > 0) {
    throw new ResponseError(400, "Username or email has already existed");
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
      username: userCreds.username,
    },
  });

  if (!user || !(bcrypt.compareSync(userCreds.password, user.password))) {
    throw new ResponseError(400, "Invalid username or password");
  }

  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET environment variable is not set");
  }
  const expiresIn = 1800; // in seconds
  const token = jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    process.env.TOKEN_SECRET,
    { expiresIn }
  );
  let tokenExpiryDate = new Date(Date.now() + expiresIn * 1000);
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { token, tokenExpiry: tokenExpiryDate },
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

// Function to Update a user by accepting request body
const update = async (request) => {
  const userInputtedCreds = validate(updateUserValidationSchema, request.body);

  const user = request.user;
  let newUserCreds = {};
  // Handle password
  if (userInputtedCreds.password) {
    if (!bcrypt.compareSync(userInputtedCreds.password, user.password)) {
      throw new ResponseError(400, "Invalid password");
    }
    newUserCreds.password = bcrypt.hashSync(userInputtedCreds.password, 10);
  }
  // Handle email
  if (userInputtedCreds.email) {
    if (userInputtedCreds.email !== user.email) {
      const countUser = await prisma.user.count({
        where: {
          email: userInputtedCreds.email,
        },
      });
      if (countUser > 0) {
        throw new ResponseError(400, "Email has already existed");
      }
      newUserCreds.email = userInputtedCreds.email.toLowerCase();
    }
  }
  // Handle username
  if (
    userInputtedCreds.username &&
    userInputtedCreds.username !== user.username
  ) {
    // Only update the username if it's different from the current one
    const countUser = await prisma.user.count({
      where: {
        username: user.username,
      },
    });

    if (countUser > 0) {
      throw new ResponseError(400, "Username has already existed");
    }
    newUserCreds.username = userInputtedCreds.username.toLowerCase();
  }

  return prisma.user.update({
    where: { id: user.id },
    data: newUserCreds,
    select: {
      username: true,
      email: true,
    },
  });
};

const me = async (user) => {
  return {
    username: user.username,
    email: user.email,
  };
};

const logout = async (req) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { token: null },
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
};
