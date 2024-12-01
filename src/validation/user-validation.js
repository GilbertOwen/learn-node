import { z } from "zod";

const registerUserValidationSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginUserValidationSchema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
});

const updateUserValidationSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
}).partial();

export { registerUserValidationSchema, loginUserValidationSchema, updateUserValidationSchema };
