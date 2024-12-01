import express from "express";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
const app = express();
app.use(express.json());
app.use(publicRouter);
app.use(errorMiddleware);

export { app };