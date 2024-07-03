import { NEW_REQUEST, REFETCH_CHATS } from "../constants/event.js";
import { getOtherMembers } from "../lib/helper.js";
import Chat from "../models/chat.models.js";
import Request from "../models/request.models.js";
import User from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { emitEvent, uploadFilesToCloudinary } from "../utils/feature.js";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "ERROR :: WHILE GENERATING ACCESS AND REFRESH TOKEN :: ",
      error
    );
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, username, password, bio } = req.body;
    const file = req.file;
    if (!file) {
      return res
        .status(404)
        .json(ApiResponse(404, "Avatar file required."));
    }
    console.log("file :", file);

    const result = await uploadFilesToCloudinary([file]); //await uploadFilesToCloudinary([file]);
    // console.log("result: ", result[0]);
    if (!result) {
      throw new ApiError(404, "Image not uploaded.");
    }

    const user = await User.create({
      name,
      username,
      password,
      bio,
      avatar: {
        public_id: result[0].public_id,
        url: result[0].url,
      },
    });
    if (!user) {
      return res.status(500).json(ApiResponse(500, "User not created."));
    }

    const savedUser = await User.findById(user._id).select("-password");

    return res
      .status(201)
      .json(new ApiResponse(201, savedUser, "user created successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        400,
        `Duplicate field - ${Object.keys(error.keyPattern).join(",")}`
      );
    }
    console.log("Error while creating an user :: ", error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { name, password, username } = req.body;
    if (!username && !name) {
      throw new ApiError(400, "username or email is require");
    }
    const user = await User.findOne({
      $or: [{ username }, { name }],
    });
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            refreshToken,
            accessToken,
          },
          "user logged in successfully"
        )
      );
  } catch (error) {
    console.log("ERROR :: WHILE LOGGING USER :: ", error);
  }
};

const getMyProfile = async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched"));
};

const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "user logout successfully"));
  } catch (error) {
    console.log("ERRO WHILE LOGOUT USER :: ", error);
  }
};

const searchUser = async (req, res) => {
  try {
    const { name = "" } = req.query; // name of a user
    // finding all my chats...
    const myChats = await Chat.find({
      groupChat: false,
      members: req.user._id,
    });
    // all friends i have chatted with...
    const allUserFromMyChat = myChats.map((chat) => chat.members).flat();
    // finding all user except me and my friend..
    const allUserExceptMeAndFriends = await User.find({
      _id: { $nin: allUserFromMyChat },
      name: { $regex: name, $options: "i" },
    });
    const users = allUserExceptMeAndFriends.map(({ _id, name, avatar }) => ({
      _id,
      name,
      avatar: avatar.url,
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, { users: users }, "fetched from query."));
  } catch (error) {
    console.log("ERROR WHILE FETCHING USER FROM URL :: ", error);
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body; // whom to send friend request.
    const request = await Request.findOne({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });

    if (request) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Friend request already exists."));
    }

    await Request.create({
      sender: req.user._id,
      receiver: userId,
    });
    emitEvent(req, NEW_REQUEST, [userId]);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Friend request sent."));
  } catch (error) {
    console.log("ERROR WHILE SENDING FRIEND REQUEST :: ", error.message);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal Server Error."));
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId, accept } = req.body; //accept:boolean ,requestId:id of request.
    const request = await Request.findById(requestId)
      .populate("sender", "name")
      .populate("receiver", "name");
    if (!request) {
      throw new ApiError(404, "Request not found.!");
    }
    if (request.receiver._id.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "You are not authorized to accept the request");
    }
    if (!accept) {
      await request.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Friend request rejected."));
    }
    const members = [request.sender._id, request.receiver._id];
    await Promise.all([
      Chat.create({
        members,
        name: `${request.sender.name}-${request.receiver.name}`,
      }),
      request.deleteOne(),
    ]);
    emitEvent(req, REFETCH_CHATS, members);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { senderId: request.sender._id },
          "Friend Request Accepted"
        )
      );
  } catch (error) {
    console.log("ERROR WHILE ACCEPTING FRIEND REQUEST :: ", error);
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const requests = await Request.find({ receiver: req.user._id }).populate(
      "sender",
      "name avatar"
    );

    const allRequests = requests.map(({ _id, sender }) => ({
      _id,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    }));

    return res.status(200).json(new ApiResponse(200, { allRequests }));
  } catch (error) {
    console.log("ERROR WHILE FETCHING NOTIFICATIONS :: ", error);
  }
};

const getMyFriends = async (req, res) => {
  try {
    const chatId = req.query.chatId;
    const chats = await Chat.find({
      members: req.user._id,
      groupChat: false,
    }).populate("members", "name avatar");
    const friends = chats.map(({ members }) => {
      const otherUser = getOtherMembers(members, req.user._id); //return member.find((member) => member._id.toString() !== userId.toString());
      if (!otherUser) {
        return null;
      }
      return {
        _id: otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar,
      };
    });
    console.log("friends : ", friends);
    if (chatId) {
      const chat = await Chat.findById(chatId);
      console.log("chat : ", chat);
      const availableFriends = friends.filter(
        (friend) =>
          friend !== null && friend && !chat.members.includes(friend._id)
      );
      return res.status(200).json(new ApiResponse(200, availableFriends));
    } else {
      return res.status(200).json(new ApiResponse(200, friends));
    }
  } catch (error) {
    console.log("ERROR WHILE FETCHING ALL MY FRIENDS :: ", error);
  }
};

export {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
  searchUser,
  sendFriendRequest,
};

// chatId=666fcc7e1dbac520c4b30e14
