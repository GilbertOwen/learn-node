import jwt from "jsonwebtoken";
import { prisma } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  registerUserValidationSchema,
  loginUserValidationSchema,
} from "../validation/user-validation.js";
import { validate } from "../validation/validation.js";
import bcrypt from "bcrypt";

// Function to register a new user by accepting request body
const register = async (request) => {
  const user = validate(registerUserValidationSchema, request);

  user.password = await bcrypt.hash(user.password, 10);

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
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });
  } catch (err) {
    console.error("Failed to update user token:", err.message);
    throw new Error("Error updating user token");
  }

  return {
    token: {
      token,
      expiresIn: Date.now() + expiresIn * 1000,
    },
    user: {
      username: user.username,
      email: user.email,
    },
  };
};

export default {
  register,
  login,
};
