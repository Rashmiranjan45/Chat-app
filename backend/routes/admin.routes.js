import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  getAdminData,
  getAllChats,
  getAllMessages,
  getAllUsers,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import { adminLoginValidator, validateHandler } from "../lib/validator.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router
  .route("/verify")
  .post(adminLoginValidator(), validateHandler, adminLogin);
router.route("/logout").get(adminLogout);

// Only admin can access...
router.route("/").get(verifyAdmin,getAdminData)
router.route("/users").get(verifyAdmin,getAllUsers);
router.route("/chats").get(verifyAdmin,getAllChats);
router.route("/messages").get(verifyAdmin,getAllMessages);
router.route("/stats").get(verifyAdmin,getDashboardStats);

export default router;
