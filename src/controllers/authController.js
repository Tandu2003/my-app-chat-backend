const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const jwtConfig = require("../config/jwt");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

// Đăng ký với mã hóa mật khẩu và gửi email xác thực
exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được đăng ký" });
    }

    // Tạo token xác thực email (JWT, 15 phút)
    const emailVerificationToken = jwt.sign({ email }, jwtConfig.secret, { expiresIn: "15m" });
    const emailVerificationTokenExpires = Date.now() + 15 * 60 * 1000;

    const user = new User({
      email,
      password,
      fullName,
      emailVerificationToken,
      emailVerificationTokenExpires,
      isEmailVerified: false,
    });
    await user.save();

    // Gửi email xác thực
    await sendVerificationEmail(user.email, emailVerificationToken);

    res
      .status(201)
      .json({ message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." });
  } catch (err) {
    next(err);
  }
};

// Xác thực email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Thiếu token xác thực" });

    let payload;
    try {
      payload = jwt.verify(token, jwtConfig.secret);
    } catch (err) {
      return res.status(400).json({ message: "Token xác thực không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findOne({
      email: payload.email,
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token xác thực không hợp lệ hoặc đã hết hạn" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Xác thực email thành công. Bạn có thể đăng nhập." });
  } catch (err) {
    next(err);
  }
};

// Đăng nhập với kiểm tra mật khẩu và xác thực email
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra xác thực email
    if (!user.isEmailVerified) {
      // Nếu token hết hạn, tạo lại token mới và gửi lại email xác thực
      if (!user.emailVerificationTokenExpires || user.emailVerificationTokenExpires < Date.now()) {
        // Tạo token xác thực email (JWT, 15 phút)
        const emailVerificationToken = jwt.sign({ email }, jwtConfig.secret, { expiresIn: "15m" });
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationTokenExpires = Date.now() + 15 * 60 * 1000;
        await user.save();
        await sendVerificationEmail(user.email, emailVerificationToken);
        return res.status(403).json({
          message:
            "Tài khoản chưa xác thực email. Mã xác thực đã hết hạn, một email xác thực mới đã được gửi.",
        });
      }
      return res
        .status(403)
        .json({ message: "Tài khoản chưa xác thực email. Vui lòng kiểm tra email để xác thực." });
    }
    const isMatch = await comparePassword(password, user.password);

    // Kiểm tra mật khẩu
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

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ user: userObj });
  } catch (err) {
    next(err);
  }
};

// Đăng xuất: xóa cookie token
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Đăng xuất thành công" });
};
