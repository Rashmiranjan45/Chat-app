import { body, validationResult, check, param, query } from "express-validator";

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);
  const errorMessage = errors
    .array()
    .map((error) => error.msg)
    .join(", ");
  console.log(errorMessage);
  console.log(errors);
  if (errors.isEmpty()) {
    return next();
  }
};

const registerValidator = () => [
  body("name", "Please Enter Name").notEmpty(),
  body("username", "Please Enter username").notEmpty(),
  body("bio", "Please Enter bio").notEmpty(),
  body("password", "Please Enter password").notEmpty(),
];

const loginValidator = () => [
  body("username", "Please Enter username").notEmpty(),
  body("password", "Please Enter password").notEmpty(),
];

const newGroupValidator = () => [
  body("name", "Please Enter name").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please Enter members")
    .isArray({ min: 2, max: 100 })
    .withMessage("Members must be 2-100"),
];

const addMemberValidator = () => [
  body("chatId", "Please Enter chatId").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please Enter members")
    .isArray({ min: 1, max: 97 })
    .withMessage("Members must be 1-97"),
];

const removeMemberValidator = () => [
  body("chatId", "Please Enter chatId").notEmpty(),
  body("userId", "Please Enter userId").notEmpty(),
];

const senAttachmentValidator = () => [
  body("chatId", "please Enter chatId").notEmpty(),
];

const chatIdValidator = () => [param("id", "please Enter chatId").notEmpty()];

const renameValidator = () => [
  param("id", "please Enter chatId").notEmpty(),
  body("name", "please Enter new name").notEmpty(),
];

const sendRequestValidator = () => [
  body("userId", "please Enter userId").notEmpty(),
];

const acceptRequestValidator = () => [
  body("requestId", "please Enter requestId").notEmpty(),
  body("accept")
    .notEmpty()
    .withMessage("please Add Accept")
    .isBoolean()
    .withMessage("Accept must be a boolean"),
];

const adminLoginValidator = () => [
  body("secretKey", "Please Enter Secret Key").notEmpty(),
];

export {
  registerValidator,
  validateHandler,
  loginValidator,
  newGroupValidator,
  addMemberValidator,
  removeMemberValidator,
  senAttachmentValidator,
  chatIdValidator,
  renameValidator,
  sendRequestValidator,
  acceptRequestValidator,
  adminLoginValidator,
};
