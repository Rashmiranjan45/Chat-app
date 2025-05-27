import dotenv from "dotenv";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
} from "../constants/event.js";
import connectDB from "../database/index.js";
import { getSockets } from "../lib/helper.js";
import Message from "../models/message.models.js";
import { app, server } from "./app.js";
import { corsOptions } from "../constants/config.js";
import cookieParser from "cookie-parser";
import { socketAuthenticator } from "../middlewares/socket.middleware.js";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables
dotenv.config({
  path: "./.env",
});
// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});
app.set("io", io);
export const userSocketIDs = new Map();
const onlineUsers = new Set();

connectDB()
  .then(() => {
    console.log("MONGODB CONNECTED SUCCESSFULLY.");
    server.listen(process.env.PORT, () => {
      console.log(
        `⚙️  Server started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} Mode`
      );
    });
  })
  .catch(() => {
    console.log("MONGODB CONNECTION FAILED");
  });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//socket connection...

//socket middleware...
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, async (err) => {
    await socketAuthenticator(err, socket, next);
  });
});
io.on("connection", (socket) => {
  const user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id.toString());

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };
    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });
    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });
  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());
    const memberSocket = getSockets(members);
    io.to(memberSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });
  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());
    const memberSocket = getSockets(members);
    io.to(memberSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});
