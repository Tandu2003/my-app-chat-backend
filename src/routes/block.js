const express = require("express");
const router = express.Router();
const blockController = require("../controllers/blockController");
const auth = require("../middleware/auth");

// POST /api/blocks - chặn người dùng
router.post("/", auth, blockController.blockUser);

// DELETE /api/blocks - bỏ chặn người dùng
router.delete("/", auth, blockController.unblockUser);

// GET /api/blocks/blocked-by - lấy danh sách bị chặn bởi người khác
router.get("/blocked-by", auth, blockController.getBlockedByUsers);

// GET /api/blocks - lấy danh sách đã chặn
router.get("/", auth, blockController.getBlockedUsers);

module.exports = router;
