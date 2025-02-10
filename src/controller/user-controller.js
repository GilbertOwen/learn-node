import userService from "../service/user-service.js";

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

    res.setHeader("Set-Cookie", `auth=${bearerToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; ${process.env.NODE_ENV !== "development" ? "Secure" : ""}`);


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
    const result = await userService.me(req.user);
    res.status(200).json({
      data: result,
      message: "Successfully retrieved user's information",
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await userService.update(req);
    res.status(200).json({
      data: result,
      message: "Successfully updated user's information",
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await userService.logout(req);
    res.status(200).json({
      message: "Successfully logged out from user's account",
    });
  } catch (err) {
    next(err);
  }
};

export default { register, login, me, update, logout };
