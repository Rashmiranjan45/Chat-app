import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verifyAdmin = async (req, _, next) => {
  try {
    const token =
      req.cookies?.["admin-token"] ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ADMIN_TOKEN_SECRET_KEY);
    const isMatched = decodedToken === process.env.ADMIN_SECRET_KEY
    if (!isMatched) {
        throw new ApiError(401,"Only Admin can access this routes")
    }
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
};

