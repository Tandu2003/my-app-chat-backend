const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/friendRequestController");
const auth = require("../middleware/auth");

// Gửi lời mời kết bạn
router.post("/", auth, friendRequestController.sendRequest);

// Lấy danh sách lời mời nhận được
router.get("/received", auth, friendRequestController.getReceivedRequests);

// Lấy danh sách lời mời đã gửi
router.get("/sent", auth, friendRequestController.getSentRequests);

// Chấp nhận lời mời
router.post("/:id/accept", auth, friendRequestController.acceptRequest);

// Từ chối lời mời
router.post("/:id/reject", auth, friendRequestController.rejectRequest);

// Xóa lời mời đã gửi (người gửi)
router.delete("/:id", auth, friendRequestController.deleteRequest);

module.exports = router;
