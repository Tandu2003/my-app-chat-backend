const express = require("express");
const router = express.Router();

const userRoutes = require("./user");
const authRoutes = require("./auth");

router.get("/", (req, res) => {
  res.send("API is running");
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

module.exports = router;
