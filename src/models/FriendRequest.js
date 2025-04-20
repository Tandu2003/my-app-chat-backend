const mongoose = require("mongoose");

/**
 * FriendRequestSchema fields:
 * - sender: Người gửi lời mời (User)
 * - receiver: Người nhận lời mời (User)
 * - status: Trạng thái lời mời ("pending", "accepted", "rejected")
 * - createdAt: Thời gian gửi lời mời
 */
const FriendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);
