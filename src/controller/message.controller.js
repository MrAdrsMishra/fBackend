import mongoose, { isValidObjectId, Schema } from "mongoose";
import { Message } from "../models/message.model.js";
import { Conversation } from "../models/Conversation.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import { asyncHandler } from "../utility/asynchHandler.js";

const createConversation = asyncHandler(async (req, res) => {
//   const { senderId } = req.user?._id;
console.log("reached backend createConversation");
  const { senderId,recieverId } = req.body;
  if (!senderId || !recieverId) {
    return res
      .status(400)
      .json(new ApiError(400, "Sender ID and Reciever ID are required"));
  }
  // Check if a conversation already exists between the two users
  const existingConversation = await Conversation.findOne({
    participants: { $all: [senderId, recieverId] },
  });
  if (existingConversation) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          201,
          existingConversation,
          "Conversation already exists"
        )
      );
  }
  // Create a new conversation
  const newConversation = await Conversation.create({
    participants: [senderId, recieverId],
  });
  if (!newConversation) {
    return res
      .status(500)
      .json(new ApiError(500, "Failed to create conversation"));
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, newConversation, "Conversation created successfully")
    );
});

const loadAllConversations = asyncHandler(async (req, res) => {
  const userId = req.query.userId;

  const conversations = await Conversation.find({
    participants: { $in: [userId] },
  });

  if (!conversations || conversations.length === 0) {
    return res.status(404).json(new ApiError(404, "No conversations found"));
  }

  const conversationData = conversations.map((conversation) => {
    const opponentUserId = conversation.participants.find(
      (participantId) => participantId.toString() !== userId
    );

    return {
      conversationId: conversation._id,
      opponentUserId,
    };
  });
  return res
    .status(200)
    .json(new ApiResponse(200, conversationData, "Conversations loaded"));
});

const loadOpponentUserDetails = asyncHandler(async (req, res) => {
  const { opponentUserIds } = req.body;

  if (!opponentUserIds || opponentUserIds.length === 0) {
    return res
      .status(400)
      .json(new ApiError(400, "Opponent user IDs not provided"));
  }

  // Fetch all users whose _id is in opponentUserIds
  const opponentUsers = await User.find({
    _id: { $in: opponentUserIds },
  }).select("photo fullName updatedAt");

  if (!opponentUsers || opponentUsers.length === 0) {
    return res.status(404).json(new ApiError(404, "Opponent users not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        opponentUsers,
        "Opponent user details loaded successfully"
      )
    );
});

const loadMessages = asyncHandler(async (req, res) => {
  const { conversationId, timeStamp, limit = 20 } = req.query;

  if (!conversationId || !isValidObjectId(conversationId)) {
    return res.status(400).json(new ApiError(400, "Invalid conversation ID"));
  }

  const query = { conversationId };

  // If timeStamp is provided, fetch older messages than this time
  if (timeStamp) {
    query.createdAt = { $lt: new Date(timeStamp) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 }) // newest first
    .limit(parseInt(limit))
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, messages.reverse(), "Messages loaded"));
});
const sendMessage = asyncHandler(async (req, res) => {
  const { content, conversationId, senderId, recieverId } = req.body;

  if (!content || !conversationId || !senderId || !recieverId) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  const newMessage = await Message.create({
    content,
    conversation: conversationId,
    sender: senderId,
    reciever: recieverId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});
export {
  loadAllConversations,
  loadOpponentUserDetails,
  loadMessages,
  sendMessage,
  createConversation,
};
