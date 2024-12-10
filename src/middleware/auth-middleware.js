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
      select: {
        id: true,
        username: true,
        email: true,
        tokenExpiry: true,
      },
    });
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        errors: "Invalid token",
      });
    }
    if (user.tokenExpiry) {
      const expiryDate = new Date(user.tokenExpiry);
      if (expiryDate.getTime() <= Date.now()) {
        // Expired token: clear the token and tokenExpiry fields
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            token: null,
            tokenExpiry: null,
          },
        });

        return res.status(401).json({
          message: "Unauthorized",
          errors: "Token has expired",
        });
      }
    }
    req.user = user;
    next();
  }
};
