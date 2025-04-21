const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// GET /api/users - lấy tất cả người dùng
router.get("/", userController.getAllUsers);

// GET /api/users/me - lấy thông tin người dùng hiện tại (yêu cầu đăng nhập)
router.get("/me", auth, userController.getCurrentUser);

// GET /api/users/search?query=keyword - tìm kiếm người dùng theo email hoặc tên (chỉ bạn bè)
router.get("/search", auth, userController.searchUsers);

// PUT /api/users/change-password - đổi mật khẩu (yêu cầu đăng nhập)
router.put("/change-password", auth, userController.changePassword);

// GET /api/users/:id - lấy người dùng theo id
router.get("/:id", userController.getUserById);

// POST /api/users - tạo người dùng mới
router.post("/", userController.createUser);

// PUT /api/users/:id - cập nhật thông tin người dùng
router.put("/:id", userController.updateUser);

// DELETE /api/users/:id - xóa người dùng
router.delete("/:id", userController.deleteUser);

module.exports = router;
