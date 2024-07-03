import { Router } from "express";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachment,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { attachmentMulter } from "../middlewares/multer.middleware.js";
import {
  addMemberValidator,
  chatIdValidator,
  newGroupValidator,
  removeMemberValidator,
  renameValidator,
  senAttachmentValidator,
  validateHandler,
} from "../lib/validator.js";

const router = Router();

router
  .route("/newChat")
  .post(verifyJWT, newGroupValidator(), validateHandler, newGroupChat);
router.route("/myChat").get(verifyJWT, getMyChats);
router.route("/myGroup").get(verifyJWT, getMyGroups);
router
  .route("/add-members")
  .put(verifyJWT, addMemberValidator(), validateHandler, addMembers);
router
  .route("/remove-member")
  .put(verifyJWT, removeMemberValidator(), validateHandler, removeMember);
router
  .route("/leave/:id")
  .delete(verifyJWT, chatIdValidator(), validateHandler, leaveGroup);
router
  .route("/message")
  .post(
    verifyJWT,
    attachmentMulter,
    senAttachmentValidator(),
    validateHandler,
    sendAttachment
  );
router
  .route("/message/:id")
  .get(verifyJWT, chatIdValidator(), validateHandler, getMessages);
router
  .route("/:id")
  .get(verifyJWT, chatIdValidator(), validateHandler, getChatDetails)
  .put(verifyJWT, renameValidator(), validateHandler, renameGroup)
  .delete(verifyJWT, chatIdValidator(), validateHandler, deleteChat);

export default router;
