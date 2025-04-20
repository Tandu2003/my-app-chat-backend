const chatService = require("../services/chatService");

// Lấy tất cả chat của user
exports.getMyChats = async (req, res, next) => {
  try {
    const chats = await chatService.getAllChatsForUser(req.user._id);
    res.json(chats);
  } catch (err) {
    next(err);
  }
};

// Lấy chi tiết 1 chat
exports.getChatById = async (req, res, next) => {
  try {
    const chat = await chatService.getChatById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Không tìm thấy chat" });
    // Kiểm tra quyền truy cập
    if (!chat.participants.some((u) => u._id.equals(req.user._id)))
      return res.status(403).json({ message: "Không có quyền truy cập chat này" });
    res.json(chat);
  } catch (err) {
    next(err);
  }
};

// Tạo chat mới (1-1)
exports.createChat = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: "Thiếu participantId" });
    if (participantId === req.user._id.toString())
      return res.status(400).json({ message: "Không thể chat với chính mình" });
    const chat = await chatService.createChat([req.user._id, participantId]);
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

// Gửi tin nhắn vào chat
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });
    const chat = await chatService.getChatById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Không tìm thấy chat" });
    if (!chat.participants.some((u) => u._id.equals(req.user._id)))
      return res.status(403).json({ message: "Không có quyền gửi tin nhắn vào chat này" });
    const message = await chatService.addMessageToChat(chat._id, req.user._id, content);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};
