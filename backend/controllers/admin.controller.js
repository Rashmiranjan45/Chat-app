import Chat from "../models/chat.models.js";
import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import  jwt  from "jsonwebtoken";
const adminLogin = async (req, res) => {
  try {
    const { secretKey } = req.body;
    const adminSecretKey = process.env.ADMIN_SECRET_KEY || "RO45&&RR45";
    const isMatched = secretKey === adminSecretKey;
    if (!isMatched) {
      throw new ApiError(401, "Inavalid Admin credentials");
    }
    const token = jwt.sign(secretKey, process.env.ADMIN_TOKEN_SECRET_KEY);
    return res
      .status(200)
      .cookie("admin-token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 15,
      })
      .json(
        new ApiResponse(200, {}, "AUTHENTICATED SUCCESSFULLY , WELCOME BOSS ")
      );
  } catch (error) {
    console.log("ADMIN : ERROR : WHILE LOGIN ADMIN :: ", error);
  }
};

const getAdminData = async (req,res) => {
  try {
    return res.status(200).json(new ApiResponse(200,{admin:true},))
  } catch (error) {
    console.log("ADMIN : ERROR : WHILE FETCHING ADMIN DETAILS :: ",error)
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    const transformedUsers = await Promise.all(
      users.map(async ({ name, username, avatar, _id }) => {
        const [groups, friends] = await Promise.all([
          Chat.countDocuments({ groupChat: true, members: _id }),
          Chat.countDocuments({ groupChat: false, members: _id }),
        ]);
        return {
          name,
          username,
          avatar: avatar.url,
          _id,
          groups,
          friends,
        };
      })
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { users: transformedUsers },
          "all user fetched successfully"
        )
      );
  } catch (error) {
    console.log("ADMIN : ERROR : WHILE FETCHING ALL USERS :: ", error);
  }
};

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");

    const transformedChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, name, creator }) => {
        const totalMessages = await Message.countDocuments({ chat: _id });
        return {
          _id,
          groupChat,
          name,
          avatar: members.slice(0, 3).map((member) => member.avatar.url),
          members: members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url,
          })),
          creator: {
            name: creator?.name || "None",
            avatar: creator?.avatar.url || "",
          },
          totalMembers: members.length,
          totalMessages,
        };
      })
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { chats: transformedChats },
          "All chats fetched successfully"
        )
      );
  } catch (error) {
    console.log("ADMIN : ERROR : WHILE FETCHING ALL CHATS :: ", error);
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate("sender", "name avatar")
      .populate("chat", "groupChat");

    const transformedMessages = messages.map(
      ({ content, attachments, _id, sender, createdAt, chat }) => ({
        _id,
        attachments,
        content,
        createdAt,
        chat: chat._id,
        groupChat: chat.groupChat,
        sender: {
          _id: sender._id,
          name: sender.name,
          avatar: sender.avatar.url,
        },
      })
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { messages: transformedMessages },
          "All Mesages Fetched Successfully."
        )
      );
  } catch (error) {
    console.log("ADMIN : ERROR : WHILE FETCHING ALL MESSAGES :: ", error);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [groupsCount, usersCount, messagesCount, totalChatsCount] =
      await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
      ]);
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last7DaysMessages = await Message.find({
      createdAt: {
        $gte: last7Days,
        $lte: today,
      },
    }).select("createdAt");
    const messages = new Array(7).fill(0);
    const dayInMiliseconds = 1000 * 60 * 60 * 24;
    last7DaysMessages.forEach((message) => {
      const indexApprox =
        (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
      const index = Math.floor(indexApprox);
      messages[6 - index]++;
    });

    const stats = {
      groupsCount,
      usersCount,
      messagesCount,
      totalChatsCount,
      messagesChart: messages,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, { stats }, "STATUS FETCHED"));
  } catch (error) {
    console.log(
      "ADMIN : ERROR : WHILE FETCHING STATUS IN DASHBOARD :: ",
      error
    );
  }
};

const adminLogout = async (req,res) => {
  try {
    return res
    .status(200)
    .cookie("admin-token","",{
      httpOnly:true,
      secure:true,
      maxAge:0
    })
    .json(new ApiResponse(200,{},"Admin Logout"))
  } catch (error) {
    console.log("ADMIN : ERROR : WHILE LOGOUT ADMIN :: ",error)
  }
}

export {
  getAllUsers,
  getAllChats,
  getAllMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData
};
