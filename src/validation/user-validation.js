import { z } from "zod";

const registerUserValidationSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginUserValidationSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export { registerUserValidationSchema, loginUserValidationSchema };
