const Message = require("../models/Message");
const Chat = require("../models/Chat");

module.exports = async function handleSendMessage(io, socket, data, onlineUsers) {
  console.log("sendMessage from", socket.userId, data);
  const { chatId, content } = data;
  if (!socket.userId || !chatId || !content) return;
  try {
    let message = await Message.create({
      chat: chatId,
      sender: socket.userId,
      content,
    });
    await Chat.findByIdAndUpdate(chatId, { $push: { messages: message._id } });

    let populatedMsg = await Message.findById(message._id).populate("sender", "fullName email");

    const chat = await Chat.findById(chatId).populate("participants", "_id");
    if (chat && chat.participants) {
      for (const participant of chat.participants) {
        if (participant._id.toString() !== socket.userId.toString()) {
          const receiverSocketId = onlineUsers.get(participant._id.toString());
          if (receiverSocketId) {
            const receiverSocket = io.sockets.sockets.get(receiverSocketId);
            if (receiverSocket && receiverSocket.rooms.has(chatId)) {
              await Message.findByIdAndUpdate(message._id, { status: "read" });
            } else {
              await Message.findByIdAndUpdate(message._id, { status: "delivered" });
            }
            populatedMsg = await Message.findById(message._id).populate("sender", "fullName email");
            break;
          }
        }
      }
    }

    io.to(chatId).emit("receiveMessage", populatedMsg);
  } catch (err) {
    // Có thể gửi lỗi về client nếu muốn
  }
};
