import express from "express";
import userController from "../controller/user-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const userRouter = express.Router();
userRouter.use(authMiddleware);
userRouter.get("/api/auth/me", userController.me);
userRouter.patch("/api/auth/current", userController.update);
userRouter.post("/api/auth/logout", userController.logout);

export { userRouter };
