const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/register - đăng ký tài khoản mới
router.post("/register", authController.register);

// GET /api/auth/verify-email - xác thực email
router.get("/verify-email", authController.verifyEmail);

// POST /api/auth/login - đăng nhập
router.post("/login", authController.login);

// POST /api/auth/logout - đăng xuất
router.post("/logout", authController.logout);

module.exports = router;
