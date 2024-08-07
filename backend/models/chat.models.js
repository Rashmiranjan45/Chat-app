import mongoose, { Schema, model } from "mongoose";

const chatShema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    groupChat: {
      type: Boolean,
      default: false
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User"
    },
    members: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ]
  },
  {
    timestamps: true,
  }
);

const Chat = model("Chat", chatShema);

export default Chat
