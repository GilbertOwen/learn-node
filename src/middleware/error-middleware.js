import { ResponseError } from "../error/response-error.js";
import { ZodError } from "zod";

export const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }
    if (err instanceof ResponseError) {
        res.status(err.status)
           .json({ message: err.message, errors: err.errors })
           .end();
    } else if (err instanceof ZodError) {
        res.status(400)
           .json({ message: "Failed to insert user's information, please try again", errors: err.errors })
           .end();
    } else {
        res.status(500)
           .json({ message: "Internal Server Error" })
           .end();
    }
};
