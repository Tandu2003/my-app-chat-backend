const Chat = require("../models/Chat");
const Message = require("../models/Message");

const getAllChatsForUser = async (userId) => {
  return Chat.find({ participants: userId })
    .populate("participants", "fullName email")
    .populate({
      path: "messages",
      options: { sort: { createdAt: 1 } },
      populate: { path: "sender", select: "fullName email" },
    });
};

const getChatById = async (chatId) => {
  return Chat.findById(chatId)
    .populate("participants", "fullName email")
    .populate({
      path: "messages",
      options: { sort: { createdAt: 1 } },
      populate: { path: "sender", select: "fullName email" },
    });
};

const createChat = async (participants) => {
  // Không tạo chat trùng giữa 2 người
  if (participants.length === 2) {
    const existing = await Chat.findOne({
      participants: { $all: participants, $size: 2 },
    });
    if (existing) return existing;
  }
  const chat = new Chat({ participants });
  return chat.save();
};

const addMessageToChat = async (chatId, sender, content) => {
  const message = await Message.create({ sender, content, chat: chatId });
  await Chat.findByIdAndUpdate(chatId, { $push: { messages: message._id } });
  return message;
};

module.exports = {
  getAllChatsForUser,
  getChatById,
  createChat,
  addMessageToChat,
};
