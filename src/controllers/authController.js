const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const jwtConfig = require("../config/jwt");

// Đăng ký với mã hóa mật khẩu
exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được đăng ký" });
    }
    const hashedPassword = await hashPassword(password);
    const user = new User({ email, password: hashedPassword, fullName });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Đăng nhập với kiểm tra mật khẩu và tạo JWT token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }
    // Tạo JWT
    const token = jwt.sign({ id: user._id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
    // Đặt token vào cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      sameSite: "lax",
    });
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

// Đăng xuất: xóa cookie token
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Đăng xuất thành công" });
};
