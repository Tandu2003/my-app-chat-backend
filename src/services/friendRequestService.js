const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

const createRequest = async (sender, receiver) => {
  // Không cho phép gửi trùng
  const exists = await FriendRequest.findOne({ sender, receiver, status: "pending" });
  if (exists) throw new Error("Đã gửi lời mời kết bạn trước đó");

  // Không cho phép gửi nếu đã là bạn bè
  const senderUser = await User.findById(sender);
  if (senderUser.friends.includes(receiver)) {
    throw new Error("Người này đã là bạn bè");
  }

  // Tạo request
  const request = await FriendRequest.create({ sender, receiver });

  // Thêm vào friendRequests của receiver và sentFriendRequests của sender
  await User.findByIdAndUpdate(sender, { $addToSet: { sentFriendRequests: request._id } });
  await User.findByIdAndUpdate(receiver, { $addToSet: { friendRequests: request._id } });

  return request;
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
  await User.findByIdAndUpdate(req.sender, { $addToSet: { friends: req.receiver } });
  await User.findByIdAndUpdate(req.receiver, { $addToSet: { friends: req.sender } });

  // Xóa request khỏi friendRequests của receiver và sentFriendRequests của sender
  await User.findByIdAndUpdate(req.sender, { $pull: { sentFriendRequests: req._id } });
  await User.findByIdAndUpdate(req.receiver, { $pull: { friendRequests: req._id } });

  return req;
};

const rejectRequest = async (requestId, userId) => {
  const req = await FriendRequest.findOne({ _id: requestId, receiver: userId, status: "pending" });
  if (!req) throw new Error("Không tìm thấy lời mời kết bạn");
  req.status = "rejected";
  await req.save();

  // Xóa request khỏi friendRequests của receiver và sentFriendRequests của sender
  await User.findByIdAndUpdate(req.sender, { $pull: { sentFriendRequests: req._id } });
  await User.findByIdAndUpdate(req.receiver, { $pull: { friendRequests: req._id } });

  return req;
};

// Xóa lời mời đã gửi (người gửi)
const deleteRequest = async (requestId, userId) => {
  const req = await FriendRequest.findOne({ _id: requestId, sender: userId, status: "pending" });
  if (!req) throw new Error("Không tìm thấy lời mời kết bạn hoặc bạn không có quyền xóa");

  // Xóa request khỏi friendRequests của receiver và sentFriendRequests của sender
  await User.findByIdAndUpdate(req.sender, { $pull: { sentFriendRequests: req._id } });
  await User.findByIdAndUpdate(req.receiver, { $pull: { friendRequests: req._id } });

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
