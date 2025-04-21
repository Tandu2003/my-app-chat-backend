const Chat = require("../models/Chat");
const Message = require("../models/Message");

module.exports = async function handleConnection(io, socket, onlineUsers) {
  console.log("Socket connected:", socket.id, "userId:", socket.userId);

  if (socket.userId) {
    onlineUsers.set(socket.userId, socket.id);

    // Khi user online, chuyển các tin nhắn "sent" -> "delivered"
    Chat.find({ participants: socket.userId }).then(async (chats) => {
      for (const chat of chats) {
        await Message.updateMany(
          {
            chat: chat._id,
            status: "sent",
            sender: { $ne: socket.userId },
          },
          { status: "delivered" }
        );
      }
    });
  }
};
