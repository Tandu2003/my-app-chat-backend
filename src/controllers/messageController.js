const messageService = require("../services/messageService");

// Lấy tất cả message của 1 chat
exports.getMessagesByChat = async (req, res, next) => {
  try {
    const messages = await messageService.getMessagesByChat(req.params.chatId);
    res.json({ messages, message: "Lấy tin nhắn thành công." });
  } catch (err) {
    next(err);
  }
};

// Lấy message theo id
exports.getMessageById = async (req, res, next) => {
  try {
    const message = await messageService.getMessageById(req.params.id);
    if (!message) return res.status(404).json({ message: "Không tìm thấy message" });
    res.json({ message, message: "Lấy message thành công." });
  } catch (err) {
    next(err);
  }
};

// Tạo message mới
exports.createMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });
    const message = await messageService.createMessage({
      chat: chatId,
      sender: req.user._id,
      content,
    });
    res.status(201).json({ message, message: "Gửi tin nhắn thành công." });
  } catch (err) {
    next(err);
  }
};

// Xóa message (chỉ người gửi được xóa)
exports.deleteMessage = async (req, res, next) => {
  try {
    await messageService.deleteMessage(req.params.id, req.user._id);
    res.status(200).json({ message: "Đã xóa message" });
  } catch (err) {
    next(err);
  }
};
