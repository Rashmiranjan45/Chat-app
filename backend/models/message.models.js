import mongoose, { Schema, model } from "mongoose";

const messageShema = new Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
    },
    attachments: [ //cloudinary url
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", messageShema);

export default Message
