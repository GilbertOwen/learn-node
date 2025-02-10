import { prisma } from "../application/database.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let header = req.get("Authorization");
    if (!header) {
      return res.status(401).json({
        message: "Unauthorized",
        errors: "Authorization header is missing",
      });
    }

    header = decodeURIComponent(header);

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Unauthorized",
        errors: "Invalid Authorization format",
      });
    }

    const token = parts[1];

    const decodedToken = Buffer.from(token, "base64").toString("utf-8");

    const session = await prisma.sessionToken.findUnique({
      where: { token: decodedToken },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
        errors: "Invalid token",
      });
    }

    if (session.tokenExpiry) {
      const expiryDate = new Date(session.tokenExpiry);
      if (expiryDate.getTime() <= Date.now()) {
        await prisma.sessionToken.delete({
          where: { id: session.id },
        });

        return res.status(401).json({
          message: "Unauthorized",
          errors: "Token has expired",
        });
      }
    }

    req.user = session.user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
      errors: error.message,
    });
  }
};
