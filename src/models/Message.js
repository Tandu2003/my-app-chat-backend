const mongoose = require("mongoose");

/**
 * MessageSchema fields:
 * - sender: Người gửi tin nhắn (User)
 * - content: Nội dung tin nhắn
 * - chat: Cuộc trò chuyện 1-1 (Chat)
 * - groupChat: Nhóm chat (GroupChat)
 * - status: Trạng thái tin nhắn ("sent", "delivered", "read")
 * - createdAt: Thời gian gửi tin nhắn
 */
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }, // Đối với chat 1-1
  groupChat: { type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }, // Đối với nhóm chat
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
