const userService = require("../services/userService");
const { comparePassword, hashPassword } = require("../utils/bcrypt");

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Lấy người dùng theo ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Tạo mới người dùng
exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ message: "Đã xóa người dùng" });
  } catch (err) {
    next(err);
  }
};

// Đổi mật khẩu cho người dùng đã đăng nhập
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
    }
    const user = await userService.getUserById(userId);
    if (!user || !user.password) {
      return res.status(400).json({ message: "Người dùng không tồn tại hoặc không có mật khẩu" });
    }
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.clearCookie("token"); // Xóa token cũ, buộc đăng nhập lại
    res.json({ message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (err) {
    next(err);
  }
};
