const FriendRequest = require("../models/FriendRequest");

const createRequest = async (sender, receiver) => {
  // Không cho phép gửi trùng
  const exists = await FriendRequest.findOne({ sender, receiver, status: "pending" });
  if (exists) throw new Error("Đã gửi lời mời kết bạn trước đó");
  return FriendRequest.create({ sender, receiver });
};

const getRequestsForUser = async (userId) => {
  return FriendRequest.find({ receiver: userId, status: "pending" }).populate(
    "sender",
    "fullName email"
  );
};

const getSentRequests = async (userId) => {
  return FriendRequest.find({ sender: userId, status: "pending" }).populate(
    "receiver",
    "fullName email"
  );
};

const acceptRequest = async (requestId, userId) => {
  const req = await FriendRequest.findOne({ _id: requestId, receiver: userId, status: "pending" });
  if (!req) throw new Error("Không tìm thấy lời mời kết bạn");
  req.status = "accepted";
  await req.save();
  // Thêm bạn vào danh sách bạn bè của cả hai
  const User = require("../models/User");
  await User.findByIdAndUpdate(req.sender, { $addToSet: { friends: req.receiver } });
  await User.findByIdAndUpdate(req.receiver, { $addToSet: { friends: req.sender } });
  return req;
};

const rejectRequest = async (requestId, userId) => {
  const req = await FriendRequest.findOne({ _id: requestId, receiver: userId, status: "pending" });
  if (!req) throw new Error("Không tìm thấy lời mời kết bạn");
  req.status = "rejected";
  await req.save();
  return req;
};

// Xóa lời mời đã gửi (người gửi)
const deleteRequest = async (requestId, userId) => {
  const req = await FriendRequest.findOne({ _id: requestId, sender: userId, status: "pending" });
  if (!req) throw new Error("Không tìm thấy lời mời kết bạn hoặc bạn không có quyền xóa");
  await req.deleteOne();
};

module.exports = {
  createRequest,
  getRequestsForUser,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  deleteRequest,
};
