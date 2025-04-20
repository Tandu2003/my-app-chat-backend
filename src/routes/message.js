const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

// GET /api/messages/chat/:chatId - lấy tất cả message của 1 chat
router.get("/chat/:chatId", auth, messageController.getMessagesByChat);

// GET /api/messages/:id - lấy message theo id
router.get("/:id", auth, messageController.getMessageById);

// POST /api/messages/chat/:chatId - tạo message mới trong chat
router.post("/chat/:chatId", auth, messageController.createMessage);

// DELETE /api/messages/:id - xóa message
router.delete("/:id", auth, messageController.deleteMessage);

module.exports = router;
