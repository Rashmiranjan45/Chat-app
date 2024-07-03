import { userSocketIDs } from "../src/index.js";

export const getOtherMembers = (member, userId) => {
  if (member.length === 0) {
    console.log("member is empty");
    return null;
  }
  return member.find((member) => member._id.toString() !== userId.toString());
  // return member.filter(member => member._id.toString() !== userId.toString());
};

export const getSockets = (users = []) => {
  const sockets = users.map((user) => userSocketIDs.get(user._id.toString()));
  return sockets;
};

export const getBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;