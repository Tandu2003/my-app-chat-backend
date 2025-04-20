const Message = require("../models/Message");
const Chat = require("../models/Chat");

const getMessagesByChat = async (chatId) => {
  return Message.find({ chat: chatId }).populate("sender", "fullName email").sort({ createdAt: 1 });
};

const getMessageById = async (id) => {
  return Message.findById(id).populate("sender", "fullName email");
};

const createMessage = async ({ chat, sender, content }) => {
  // Kiểm tra chat có tồn tại không
  const chatDoc = await Chat.findById(chat);
  if (!chatDoc) {
    throw new Error("Không tìm thấy cuộc hội chat");
  }
  const message = await Message.create({ chat, sender, content });
  // Thêm message vào mảng messages của Chat
  await Chat.findByIdAndUpdate(chat, { $push: { messages: message._id } });
  return message.populate("sender", "fullName email");
};

const deleteMessage = async (id, userId) => {
  const message = await Message.findById(id);
  if (!message) throw new Error("Không tìm thấy message");
  if (message.sender.toString() !== userId.toString()) {
    throw new Error("Không có quyền xóa message này");
  }
  await message.deleteOne();
  return true;
};

module.exports = {
  getMessagesByChat,
  getMessageById,
  createMessage,
  deleteMessage,
};
