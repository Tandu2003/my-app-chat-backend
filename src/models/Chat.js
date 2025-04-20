const mongoose = require("mongoose");

/**
 * ChatSchema fields:
 * - participants: Danh sách thành viên tham gia chat (User[])
 * - messages: Danh sách tin nhắn (Message[])
 * - createdAt: Thời gian tạo cuộc trò chuyện
 */
const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", ChatSchema);
