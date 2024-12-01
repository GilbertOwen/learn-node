import { prisma } from "../application/database.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    res
      .status(401)
      .json({
        message: "Unauthorized",
        errors: "Unauthorized",
      })
      .end();
  } else {
    const user = await prisma.user.findUnique({
      where: {
        token,
      },
    });
    if(!user){
        res
        .status(401)
        .json({
          message: "Unauthorized",
          errors: "Unauthorized",
        })
        .end();
    }else{
        req.user = user;
        req.user.token = token;
        next();
    }
  }
};
