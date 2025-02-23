import express from "express";
import userController from "../controller/user-controller.js";

const publicRouter = express.Router();

publicRouter.post("/api/auth/users", userController.register);
publicRouter.post("/api/auth/login", userController.login);
publicRouter.get("/api/users/:userId", userController.profile);

export { publicRouter };
