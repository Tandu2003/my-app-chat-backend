const express = require("express");
const router = express.Router();
const friendRequestController = require("../controllers/friendRequestController");
const auth = require("../middleware/auth");

// POST /api/friend-requests
router.post("/", auth, friendRequestController.sendRequest);

// GET /api/friend-requests/received
router.get("/received", auth, friendRequestController.getReceivedRequests);

// GET /api/friend-requests/sent
router.get("/sent", auth, friendRequestController.getSentRequests);

// POST /api/friend-requests/:id/accept
router.post("/:id/accept", auth, friendRequestController.acceptRequest);

// POST /api/friend-requests/:id/reject
router.post("/:id/reject", auth, friendRequestController.rejectRequest);

// DELETE /api/friend-requests/:id
router.delete("/:id", auth, friendRequestController.deleteRequest);

module.exports = router;
