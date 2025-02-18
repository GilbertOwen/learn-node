import userService from "../service/user-service.js";
import multer from "multer";
import path from "path";
import fs from "fs";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.session.user.id;
    const userFolder = `privateImage/${userId}`;
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // e.g. .jpg, .png
    const timestamp = Date.now(); // Generate unique ID using current time
    cb(null, `profile_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only .jpeg, .jpg, .png, and .webp files are allowed"),
        false
      );
    }
    cb(null, true);
  },
});

const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    res.status(200).json({
      data: result,
      message: "Successfully registered user",
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    const base64Token = Buffer.from(result.token.token).toString("base64");

    const bearerToken = `Bearer ${base64Token}`;

    res.setHeader(
      "Set-Cookie",
      `auth=${bearerToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; ${
        process.env.NODE_ENV !== "development" ? "Secure" : ""
      }`
    );

    res.status(200).json({
      data: result.user,
      message: "Successfully logged-in to user's account",
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await userService.me(req.session.user);
    res.status(200).json({
      data: result,
      message: "Successfully retrieved user's information",
    });
  } catch (err) {
    next(err);
  }
};

const profile = async (req, res, next) => {
  try {
    const result = await userService.profile(req);
    if (result == null) {
      res.status(404).json({
        message: "Failed to retrieve user's information",
      });
      return;
    }
    res.status(200).json({
      data: result,
      message: "Successfully retrieved user's information",
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  upload.single("profilePicture")(req, res, async (err) => {
    if (err) {
      // If multer fails, pass the error to the global error handler
      return next(err);
    }
    try {
      // Now that file processing is done, call the service
      const result = await userService.update(req);
      res.status(200).json({
        data: result,
        message: "Successfully updated user's information",
      });
    } catch (e) {
      next(e);
    }
  });
};

const logout = async (req, res, next) => {
  try {
    await userService.logout(req);
    res.status(200).json({
      message: "Successfully logged out from user's account",
    });
  } catch (err) {
    next(err);
  }
};

export default { register, login, me, update, logout, profile };
