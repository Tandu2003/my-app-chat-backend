const express = require("express");
const router = express.Router();

const userRoutes = require("./user");
const authRoutes = require("./auth");
const friendRequestRoutes = require("./friendRequest");
const chatRoutes = require("./chat");
const messageRoutes = require("./message");
const blockRoutes = require("./block");

router.get("/", (req, res) => {
  res.send("API is running");
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/friend-requests", friendRequestRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messageRoutes);
router.use("/blocks", blockRoutes);

module.exports = router;
