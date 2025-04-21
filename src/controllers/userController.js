const userService = require("../services/userService");
const { comparePassword, hashPassword } = require("../utils/bcrypt");

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers({
      select: "-password __v", // Không trả về mật khẩu và version
    });
    res.status(200).json({ users, message: "Lấy danh sách người dùng thành công." });
  } catch (err) {
    next(err);
  }
};

// Lấy người dùng theo ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, {
      select: "-password __v", // Không trả về mật khẩu và version
    });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json({ user, message: "Lấy thông tin người dùng thành công." });
  } catch (err) {
    next(err);
  }
};

// Tạo mới người dùng
exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, {
      select: "-password __v", // Không trả về mật khẩu và version
    });
    res.status(201).json({ user, message: "Tạo người dùng thành công." });
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, {
      select: "-password __v", // Không trả về mật khẩu và version
    });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json({ user, message: "Cập nhật thông tin người dùng thành công." });
  } catch (err) {
    next(err);
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json({ message: "Đã xóa người dùng" });
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
    res.status(200).json({ message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin người dùng đang đăng nhập
exports.getCurrentUser = async (req, res, next) => {
  try {
    res
      .status(200)
      .json({ user: req.user, message: "Lấy thông tin người dùng hiện tại thành công." });
  } catch (err) {
    next(err);
  }
};

// Tìm kiếm người dùng theo email hoặc tên (chỉ bạn bè)
exports.searchUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { email, name } = req.query;
    if (!email && !name) {
      return res.status(400).json({ message: "Thiếu tham số tìm kiếm" });
    }
    if (email) {
      // Tìm theo email (mọi user)
      const user = await userService.findUserByEmail(email, {
        select: "-password __v", // Không trả về mật khẩu và version
      });
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      return res.json({ user, message: "Tìm kiếm người dùng theo email thành công." });
    }
    if (name) {
      // Tìm theo tên trong danh sách bạn bè
      const users = await userService.findFriendsByName(userId, name);
      return res.json({ users, message: "Tìm kiếm bạn bè theo tên thành công." });
    }
  } catch (err) {
    next(err);
  }
};
