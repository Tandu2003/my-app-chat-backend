const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const jwtConfig = require("./config/jwt");
const User = require("./models/User");
const Message = require("./models/Message");
const Chat = require("./models/Chat");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: process.env.CLIENT_URL || "*",
    origin: "*",
    credentials: true,
  },
});

// Map userId <-> socketId để gửi tin nhắn realtime
const onlineUsers = new Map();

io.use(async (socket, next) => {
  // Xác thực người dùng qua token (nếu muốn bảo mật)
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
  console.log("Socket connected:", socket.id, "userId:", socket.userId);

  // Đánh dấu user online
  if (socket.userId) {
    onlineUsers.set(socket.userId, socket.id);
  }

  // Tham gia các phòng chat mà user là thành viên
  socket.on("joinChats", (chatIds) => {
    console.log("joinChats from", socket.userId, chatIds);
    if (Array.isArray(chatIds)) {
      chatIds.forEach((chatId) => socket.join(chatId));
    }
  });

  // Lắng nghe gửi tin nhắn mới
  socket.on("sendMessage", async (data) => {
    console.log("sendMessage from", socket.userId, data);
    // data: { chatId, content }
    const { chatId, content } = data;
    if (!socket.userId || !chatId || !content) return;
    try {
      // Lưu message vào DB
      let message = await Message.create({
        chat: chatId,
        sender: socket.userId,
        content,
      });
      await Chat.findByIdAndUpdate(chatId, { $push: { messages: message._id } });

      // Lấy message kèm thông tin sender
      let populatedMsg = await Message.findById(message._id).populate("sender", "fullName email");

      // Kiểm tra nếu người nhận đang online thì chuyển trạng thái thành "delivered" hoặc "read"
      // Lấy danh sách participants (ngoại trừ sender)
      const chat = await Chat.findById(chatId).populate("participants", "_id");
      if (chat && chat.participants) {
        for (const participant of chat.participants) {
          if (participant._id.toString() !== socket.userId.toString()) {
            const receiverSocketId = onlineUsers.get(participant._id.toString());
            if (receiverSocketId) {
              // Kiểm tra nếu socket của người nhận đang ở trong phòng chat này
              const receiverSocket = io.sockets.sockets.get(receiverSocketId);
              if (receiverSocket && receiverSocket.rooms.has(chatId)) {
                // Nếu đang ở trong phòng chat, đánh dấu là đã xem ("read")
                await Message.findByIdAndUpdate(message._id, { status: "read" });
              } else {
                // Nếu chỉ online, đánh dấu là đã nhận ("delivered")
                await Message.findByIdAndUpdate(message._id, { status: "delivered" });
              }
              // Lấy lại message đã cập nhật status
              populatedMsg = await Message.findById(message._id).populate(
                "sender",
                "fullName email"
              );
              break; // chỉ cần 1 người nhận online là chuyển trạng thái
            }
          }
        }
      }

      // Gửi message cho tất cả thành viên trong phòng chat
      io.to(chatId).emit("receiveMessage", populatedMsg);
    } catch (err) {
      // Có thể gửi lỗi về client nếu muốn
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id, "userId:", socket.userId);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
