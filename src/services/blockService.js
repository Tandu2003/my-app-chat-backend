const Block = require("../models/Block");

const blockUser = async (blocker, blocked) => {
  if (blocker.toString() === blocked.toString()) {
    throw new Error("Không thể tự chặn chính mình");
  }
  // Không cho phép chặn trùng
  const exists = await Block.findOne({ blocker, blocked });
  if (exists) throw new Error("Đã chặn người dùng này rồi");
  return Block.create({ blocker, blocked });
};

const unblockUser = async (blocker, blocked) => {
  const block = await Block.findOneAndDelete({ blocker, blocked });
  if (!block) throw new Error("Bạn chưa chặn người dùng này");
  return true;
};

const isBlocked = async (blocker, blocked) => {
  return !!(await Block.findOne({ blocker, blocked }));
};

const getBlockedUsers = async (blocker) => {
  return Block.find({ blocker }).populate("blocked", "fullName email");
};

const getBlockedByUsers = async (blocked) => {
  return Block.find({ blocked }).populate("blocker", "fullName email");
};

module.exports = {
  blockUser,
  unblockUser,
  isBlocked,
  getBlockedUsers,
  getBlockedByUsers,
};
