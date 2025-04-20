const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// GET /api/users
router.get("/", userController.getAllUsers);

// GET /api/users/:id
router.get("/:id", userController.getUserById);

// POST /api/users
router.post("/", userController.createUser);

// PUT /api/users/:id
router.put("/:id", userController.updateUser);

// DELETE /api/users/:id
router.delete("/:id", userController.deleteUser);

// Đổi mật khẩu (người dùng đã đăng nhập)
router.put("/change-password", auth, userController.changePassword);

module.exports = router;
