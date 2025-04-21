const blockService = require("../services/blockService");

// Chặn người dùng
exports.blockUser = async (req, res, next) => {
  try {
    const blocker = req.user._id;
    const { blocked } = req.body;
    if (!blocked) return res.status(400).json({ message: "Thiếu user cần chặn" });
    await blockService.blockUser(blocker, blocked);
    res.status(201).json({ message: "Đã chặn người dùng" });
  } catch (err) {
    next(err);
  }
};

// Bỏ chặn người dùng
exports.unblockUser = async (req, res, next) => {
  try {
    const blocker = req.user._id;
    const { blocked } = req.body;
    if (!blocked) return res.status(400).json({ message: "Thiếu user cần bỏ chặn" });
    await blockService.unblockUser(blocker, blocked);
    res.status(200).json({ message: "Đã bỏ chặn người dùng" });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách đã chặn
exports.getBlockedUsers = async (req, res, next) => {
  try {
    const users = await blockService.getBlockedUsers(req.user._id);
    res.json(users.map((b) => b.blocked));
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách bị chặn bởi người khác
exports.getBlockedByUsers = async (req, res, next) => {
  try {
    const users = await blockService.getBlockedByUsers(req.user._id);
    res.json(users.map((b) => b.blocker));
  } catch (err) {
    next(err);
  }
};
