const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

module.exports = async function handleFriendRequest(io, socket, data, onlineUsers) {
  // data: { receiver }
  const sender = socket.userId;
  const { receiver } = data;
  if (!sender || !receiver || sender === receiver) return;

  // Kiểm tra trùng lặp hoặc đã là bạn bè
  const exists = await FriendRequest.findOne({ sender, receiver, status: "pending" });
  const senderUser = await User.findById(sender);
  if (exists || senderUser.friends.includes(receiver)) return;

  // Tạo request
  const request = await FriendRequest.create({ sender, receiver });

  // Thêm vào user
  await User.findByIdAndUpdate(sender, { $addToSet: { sentFriendRequests: request._id } });
  await User.findByIdAndUpdate(receiver, { $addToSet: { friendRequests: request._id } });

  // Populate sender info
  const populatedRequest = await FriendRequest.findById(request._id).populate(
    "sender",
    "fullName email"
  );

  // Gửi realtime cho receiver nếu online
  const receiverSocketId = onlineUsers.get(receiver.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveFriendRequest", populatedRequest);
  }
  // Optionally: gửi lại cho sender để cập nhật UI
  socket.emit("friendRequestSent", populatedRequest);
};
