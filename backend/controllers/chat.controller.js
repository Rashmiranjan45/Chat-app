import {
  ALERT,
  NEW_ATTACHMENT,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/event.js";
import { getOtherMembers } from "../lib/helper.js";
import Chat from "../models/chat.models.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFilesFromCloudinary, emitEvent } from "../utils/feature.js";

const newGroupChat = async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name) {
      throw new ApiError(404, "Chat name must required.");
    }
    const allMembers = [...members, req.user];

    const chat = await Chat.create({
      name,
      groupChat: true,
      creator: req.user,
      members: allMembers,
    });

    if (!chat) {
      throw new ApiError(500, "Chat not created !");
    }
    emitEvent(req, ALERT, allMembers, `welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);

    return res
      .status(201)
      .json(new ApiResponse(201, chat, "Group chat created"));
  } catch (error) {
    console.log("ERROR WHILE CREATING NEW CHAT :: ", error);
  }
};

const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user }).populate(
      "members",
      "name avatar"
    );
    if (!chats) {
      throw new ApiError(404, "Chat does not found !");
    }

    const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
      const otherMember = getOtherMembers(members, req.user);

      return {
        _id,
        groupChat,
        name: groupChat ? name : otherMember.name,
        avatar: groupChat
          ? members.slice(0, 3).map(({ avatar }) => avatar.url)
          : [otherMember.avatar.url],
        members: members.reduce((prev, curr) => {
          if (curr._id.toString() !== req.user._id.toString()) {
            prev.push(curr._id);
          }
          return prev;
        }, []),
      };
    });

    return res
      .status(200)
      .json(new ApiResponse(200, transformedChats, "ALL CHATS FETCHED"));
  } catch (error) {
    console.log("ERROR :: WHILE FETCHING MY CHATS :: ", error);
  }
};

const getMyGroups = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: req.user,
      groupChat: true,
      creator: req.user,
    }).populate("members", "name avatar");
    const groups = chats.map(({ members, _id, groupChat, name }) => ({
      _id,
      groupChat,
      name,
      avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, groups, "GROUPS DETAILS FETCHED"));
  } catch (error) {
    console.log("ERROR :: WHILE FETCHING MY ALL GROUPS :: ", error);
  }
};

const addMembers = async (req, res) => {
  try {
    const { chatId, members } = req.body;
    if ((!chatId && !members) || members.length < 1) {
      throw new ApiError(400, "All fields are required.");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new ApiError(404, "Chat not Found.!");
    }
    if (!chat.groupChat) {
      throw new ApiError(400, "This is not a group chat");
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to add members");
    }
    const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
    const allNewMembers = await Promise.all(allNewMembersPromise);
    const uniqueMembers = allNewMembers
      .filter((i) => !chat.members.includes(i._id.toString()))
      .map((i) => i._id);

    chat.members.push(...uniqueMembers);

    if (chat.members.length > 100) {
      throw new ApiError(400, "Group members limit reached");
    }

    await chat.save();
    const allUserName = allNewMembers.map((i) => i.name).join(",");

    emitEvent(
      req,
      ALERT,
      chat.members,
      `${allUserName} has been added in the group`
    );

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Members added successfully"));
  } catch (error) {
    console.log("ERROR :: WHILE ADDING MEMBERS :: ", error);
  }
};

const removeMember = async (req, res) => {
  try {
    const { userId, chatId } = req.body;

    if (!userId && !chatId) {
      throw new ApiError(400, "All fields are required.");
    }

    const [chat, userThatWillBeRemoved] = await Promise.all([
      Chat.findById(chatId),
      User.findById(userId, "name"),
    ]);

    if (!chat) {
      throw new ApiError(404, "Chat not Found.!");
    }
    if (!chat.groupChat) {
      throw new ApiError(400, "This is not a group chat");
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to add members");
    }
    if (chat.members.length <= 3) {
      throw new ApiError(400, "Group must have at least 3 members");
    }
    chat.members = chat.members.filter(
      (member) => member.toString() !== userId.toString()
    );
    await chat.save();
    emitEvent(
      req,
      ALERT,
      chat.members,
      `${userThatWillBeRemoved.name} has been removed from the group`
    );
    emitEvent(req, REFETCH_CHATS, chat.members);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Member removed successfully."));
  } catch (error) {
    console.log("ERROR WHILE REMOVING MEMBER :: ", error);
  }
};

const leaveGroup = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, "Chat not found.!");
    }
    if (!chat.groupChat) {
      throw new ApiError(400, "This is not a group chat.");
    }
    const remainingMembers = chat.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );
    if (remainingMembers.length < 3) {
      throw new ApiError(400, "Group must have at least 3 members.");
    }

    if (chat.creator.toString() === req.user.id.toString()) {
      const randomElement = Math.floor(Math.random() * remainingMembers.length);
      const newCreator = remainingMembers[randomElement];
      chat.creator = newCreator;
    }
    chat.members = remainingMembers;
    const [user] = await Promise.all([
      User.findById(req.user._id, "name"),
      chat.save(),
    ]);
    emitEvent(
      req,
      ALERT,
      chat.members,
      `User ${user.name} has left the group.`
    );

    return res.status(200).json(new ApiResponse(200, "Member left the group"));
  } catch (error) {
    if (error.name === "CastError") {
      throw new ApiError(400,`Invalid Format of  ${error.path}`)
    }
    console.log("ERROR WHILE LEAVING FROM GROUP :: ", error);
  }
};

const sendAttachment = async (req, res) => {
  try {
    const { chatId } = req.body;
    const [chat, user] = await Promise.all([
      Chat.findById(chatId),
      User.findById(req.user._id, "name"),
    ]);

    if (!chat) {
      throw new ApiError(400, "Chat not found.!");
    }

    const files = req.files || [];

    if (files.length < 1) {
      throw new ApiError(400, "Please provide attachments.");
    }
    if (files.length > 5) {
      throw new ApiError(400,"File can't be more than 5")
    }
    // uploads files here...cloudinary...
    const attachments = [];
    const messageForDB = {
      content: "",
      attachments,
      sender: req.user._id,
      chat: chatId,
    };
    const messageForRealTime = {
      ...messageForDB,
      sender: {
        _id: req.user._id,
        name: user.name,
      },
    };

    const message = await Message.create(messageForDB);

    emitEvent(req, NEW_ATTACHMENT, chat.members, {
      message: messageForRealTime,
      chatId,
    });
    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return res
      .status(200)
      .json(new ApiResponse(200, message, "Attachment send successfully"));
  } catch (error) {
    console.log("ERROR WHILE SENDING ATTACHMENTS :: ", error);
  }
};

const getChatDetails = async (req, res) => {
  try {
    if (req.query.populate === "true") {
      const chat = await Chat.findById(req.params.id)
        .populate("members", "name avatar")
        .lean();
      if (!chat) {
        throw new ApiError(400, "Chat not found.!");
      }
      chat.members = chat.members.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url,
      }));
      return res.status(200).json(new ApiResponse(200, chat, "chats fetched"));
    } else {
      const chat = await Chat.findById(req.params.id);
      if (!chat) {
        throw new ApiError(400, "Chat not found.!");
      }
      return res.status(200).json(new ApiResponse(200, chat, "chats fetched"));
    }
  } catch (error) {
    console.log("ERROR WHILE FETCHING CHAT DETAILS :: ", error);
  }
};

const renameGroup = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { name } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(400, "Chat not found.!");
    }
    if (!chat.groupChat) {
      throw new ApiError(404, "This is not a group chat.");
    }
    if (chat.creator.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to rename the group.");
    }
    chat.name = name;
    await chat.save();
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res
      .status(200)
      .json(new ApiResponse(200, chat, "Group renamed successfully"));
  } catch (error) {
    console.log("ERROR WHILE RENAMING THE GROUP :: ", error);
  }
};

const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(400, "Chat not found.!");
    }
    const members = chat.members;
    if (chat.groupChat && chat.creator.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to delete the group.");
    }
    if (!chat.groupChat && chat.members.includes(req.user._id.toString())) {
      throw new ApiError(403, "You are not allowed to delete the group.");
    }

    const messagesWithAttachments = await Message.find({
      chat: chatId,
      attachments: { $exists: true, $ne: [] },
    });
    const public_ids = [];

    messagesWithAttachments.forEach(({ attachments }) =>
      attachments.forEach(({ public_id }) => public_ids.push(public_id))
    );

    await Promise.all([
      deleteFilesFromCloudinary(public_ids),
      chat.deleteOne(),
      Message.deleteMany({ chat: chatId })
    ])
    emitEvent(req,REFETCH_CHATS,members)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"chat deleted"))
  } catch (error) {
    console.log("ERROR WHILE DELETING CHAT :: ", error);
  }
};

const getMessages = async (req,res) => {
  try {
    const chatId = req.params.id
    const {page = 1} = req.query
    const resultPerPage = 20
    const skip = (page - 1) * resultPerPage;
    const [messages, totalMessagesCount] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resultPerPage)
        .populate("sender", "name")
        .lean(),
      Message.countDocuments({ chat: chatId }),
    ]);

    const totalPages = Math.ceil(totalMessagesCount / resultPerPage);
    return res
    .status(200)
    .json(new ApiResponse(200,{message:messages.reverse(),totalPages}))
  } catch (error) {
    console.log("ERROR WHILE FETCHING ALL MESSAGES :: ",error)
  }
}

export {
  newGroupChat,
  getMyChats,
  getMyGroups,
  addMembers,
  removeMember,
  leaveGroup,
  sendAttachment,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages
};
