const mongoose = require("mongoose");

/**
 * BlockSchema fields:
 * - blocker: Người thực hiện chặn (User)
 * - blocked: Người bị chặn (User)
 * - createdAt: Thời gian thực hiện chặn
 */
const BlockSchema = new mongoose.Schema({
  blocker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blocked: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Block", BlockSchema);
