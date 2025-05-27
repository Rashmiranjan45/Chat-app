import User from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) {
      return next(err);
    }
    const authToken = socket.request.cookies.accessToken;
    if (!authToken) {
      return next(
        new ApiResponse(401, { message: "Auth-Token doesnot found." })
      );
    }
    console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
    console.log("AuthToken received:", authToken);

    const decodedToken = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return next(new ApiResponse(401, { message: "User doesnot found" }));
    }
    socket.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return new ApiResponse(401, {
      message: "please login to access this route",
    });
  }
};

export { socketAuthenticator };
