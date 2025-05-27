import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Unauthorized: No token provided"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Unauthorized: User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          {},
          error.name === "TokenExpiredError"
            ? "Access token has expired"
            : "Access Denied: Invalid token"
        )
      );
  }
};
