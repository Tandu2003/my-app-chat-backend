const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../middleware/auth");

// GET /api/chats - lấy tất cả chat của user
router.get("/", auth, chatController.getMyChats);

// GET /api/chats/:id - lấy chi tiết 1 chat
router.get("/:id", auth, chatController.getChatById);

// POST /api/chats - tạo chat mới (1-1)
router.post("/", auth, chatController.createChat);

// POST /api/chats/:id/messages - gửi tin nhắn vào chat
router.post("/:id/messages", auth, chatController.sendMessage);

module.exports = router;
