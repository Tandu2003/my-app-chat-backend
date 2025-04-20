const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/friendRequestController");
const auth = require("../middleware/auth");

// POST /api/friend-requests - gửi lời mời kết bạn
router.post("/", auth, friendRequestController.sendRequest);

// GET /api/friend-requests/received - lấy danh sách lời mời nhận được
router.get("/received", auth, friendRequestController.getReceivedRequests);

// GET /api/friend-requests/sent - lấy danh sách lời mời đã gửi
router.get("/sent", auth, friendRequestController.getSentRequests);

// POST /api/friend-requests/:id/accept - chấp nhận lời mời kết bạn
router.post("/:id/accept", auth, friendRequestController.acceptRequest);

// POST /api/friend-requests/:id/reject - từ chối lời mời kết bạn
router.post("/:id/reject", auth, friendRequestController.rejectRequest);

// DELETE /api/friend-requests/:id - xóa lời mời đã gửi (người gửi)
router.delete("/:id", auth, friendRequestController.deleteRequest);

module.exports = router;
