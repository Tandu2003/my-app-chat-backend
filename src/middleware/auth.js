const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ cookie hoặc header
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Không có token xác thực" });
    }

    // Xác thực token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Lấy thông tin người dùng từ DB (có thể bỏ nếu chỉ cần userId)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra nếu user đã đổi mật khẩu sau khi token được phát hành
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({ message: "Vui lòng đăng nhập lại (mật khẩu đã thay đổi)" });
      }
    }

    req.user = user; // Gán thông tin user vào request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = authMiddleware;
