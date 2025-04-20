const express = require("express");
const router = express.Router();

const userRoutes = require("./user");
const authRoutes = require("./auth");
const friendRequestRoutes = require("./friendRequest");

router.get("/", (req, res) => {
  res.send("API is running");
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/friend-requests", friendRequestRoutes);

module.exports = router;
