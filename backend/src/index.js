import dotenv from "dotenv";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "../constants/event.js";
import connectDB from "../database/index.js";
import { getSockets } from "../lib/helper.js";
import Message from "../models/message.models.js";
import { server } from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import { corsOptions } from "../constants/config.js";

// Load environment variables
dotenv.config({
  path: "./.env",
});
// Initialize Socket.IO
const io = new Server(server, {
  cors:corsOptions
});
export const userSocketIDs = new Map();

connectDB(process.env.MONGODB_URI)
  .then(() => {
    console.log("MONGODB CONNECTED SUCCESSFULLY.");
    server.listen(process.env.PORT, () => {
      console.log(
        `Server started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} Mode`
      );
    });
  })
  .catch(() => {
    console.log("MONGODB CONNECTION FAILED");
  });

// cloudinary config...

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// console.log("cloudinary.config ", cloudinary.config());

//socket connection...
io.on("connection", (socket) => {
  const user = {
    _id: "assdjdj",
    name: "namehem",
  };
  userSocketIDs.set(user._id.toString(), socket.id.toString());

  console.log(`Client connected : ${socket.id}`);
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
      console.log("error while save messages ::", error);
    }
    console.log(`NEW MESSAGE : ${messageForRealTime}`);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected.");
    userSocketIDs.delete(user._id.toString());
  });
});

// for socket.io-http://localhost:5000
// seeders...

// createUser(10)
// createSingleChats(10)
// createGroupChats(10)
// createMessagesInAChat("666fcc7e1dbac520c4b30d49",50)
