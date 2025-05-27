import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies?.["admin-token"] ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("ADMIN : LOGIN :: ", token);

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Unauthorized: No token provided"));
    }

    const decodedToken = jwt.verify(token, process.env.ADMIN_TOKEN_SECRET_KEY);

    const isMatched = decodedToken === process.env.ADMIN_SECRET_KEY;

    if (!isMatched) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Only Admin can access this route"));
    }

    next();
  } catch (error) {
    console.error("Admin JWT verification error:", error);
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          {},
          error.name === "TokenExpiredError"
            ? "Admin token has expired"
            : "Invalid Admin token"
        )
      );
  }
};
