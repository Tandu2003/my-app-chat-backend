const friendRequestService = require("../services/friendRequestService");

// Gửi lời mời kết bạn
exports.sendRequest = async (req, res, next) => {
  try {
    const sender = req.user._id;
    const { receiver } = req.body;
    if (sender.toString() === receiver)
      return res.status(400).json({ message: "Không thể gửi lời mời cho chính mình" });
    const request = await friendRequestService.createRequest(sender, receiver);
    res.status(201).json({ request, message: "Gửi lời mời kết bạn thành công." });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách lời mời nhận được
exports.getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await friendRequestService.getRequestsForUser(req.user._id);
    res.json({ requests, message: "Lấy danh sách lời mời nhận được thành công." });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách lời mời đã gửi
exports.getSentRequests = async (req, res, next) => {
  try {
    const requests = await friendRequestService.getSentRequests(req.user._id);
    res.json({ requests, message: "Lấy danh sách lời mời đã gửi thành công." });
  } catch (err) {
    next(err);
  }
};

// Chấp nhận lời mời
exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await friendRequestService.acceptRequest(req.params.id, req.user._id);
    res.json({ request, message: "Chấp nhận lời mời kết bạn thành công." });
  } catch (err) {
    next(err);
  }
};

// Từ chối lời mời
exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await friendRequestService.rejectRequest(req.params.id, req.user._id);
    res.json({ request, message: "Từ chối lời mời kết bạn thành công." });
  } catch (err) {
    next(err);
  }
};

// Xóa lời mời đã gửi (người gửi)
exports.deleteRequest = async (req, res, next) => {
  try {
    await friendRequestService.deleteRequest(req.params.id, req.user._id);
    res.status(200).json({ message: "Đã xóa lời mời kết bạn" });
  } catch (err) {
    next(err);
  }
};
