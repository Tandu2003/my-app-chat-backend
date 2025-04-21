const jwt = require("jsonwebtoken");
const jwtConfig = require("./config/jwt");

// Map userId <-> socketId để gửi tin nhắn realtime
const onlineUsers = new Map();

// Import các handler
const handleConnection = require("./sockets/connection");
const handleJoinChats = require("./sockets/joinChats");
const handleSendMessage = require("./sockets/sendMessage");

module.exports = function (io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      socket.userId = decoded.id;
      next();
    } catch {
      next();
    }
  });

  io.on("connection", (socket) => {
    handleConnection(io, socket, onlineUsers);

    socket.on("joinChats", (chatIds) => handleJoinChats(io, socket, chatIds));

    socket.on("sendMessage", (data) => handleSendMessage(io, socket, data, onlineUsers));

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
      }
    });
  });
};
