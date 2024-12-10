import express from "express";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { userRouter } from "../route/protected-api.js";
const app = express();
app.use(express.json());
import cors from "cors";

app.options("*", cors()); // Preflight request support

app.use(
  cors({
    origin: ["http://localhost:3000", "http://159.65.9.173:3000"], // Front-end URL
  })
);

app.use(publicRouter);
app.use(userRouter);

app.use(errorMiddleware);

export { app };
