import { Router } from "express";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
  searchUser,
  sendFriendRequest,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { singleAvatar } from "../middlewares/multer.middleware.js";
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../lib/validator.js";
const router = Router();
router
  .route("/register")
  .post(singleAvatar, registerValidator(), validateHandler, registerUser);
router.route("/login").post(loginValidator(), loginUser);
router.route("/profile").get(verifyJWT, getMyProfile);
router.route("/search").get(verifyJWT,searchUser);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/send-request").put(verifyJWT,sendRequestValidator(),validateHandler, sendFriendRequest);
router.route("/accept-request").put(verifyJWT,acceptRequestValidator(),validateHandler,acceptFriendRequest)
router.route("/notifications").get(verifyJWT,getMyNotifications)
router.route("/friends").get(verifyJWT,getMyFriends)
export default router;
