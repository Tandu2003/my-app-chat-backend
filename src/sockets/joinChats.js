const Message = require("../models/Message");

module.exports = async function handleJoinChats(io, socket, chatIds) {
  console.log("joinChats from", socket.userId, chatIds);
  if (Array.isArray(chatIds)) {
    chatIds.forEach((chatId) => socket.join(chatId));
    for (const chatId of chatIds) {
      await Message.updateMany(
        {
          chat: chatId,
          status: { $in: ["sent", "delivered"] },
          sender: { $ne: socket.userId },
        },
        { status: "read" }
      );
    }
  }
};
