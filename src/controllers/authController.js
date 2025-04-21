const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const jwtConfig = require("../config/jwt");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const { registerSchema, loginSchema } = require("../utils/joi");

// Đăng ký với mã hóa mật khẩu và gửi email xác thực
exports.register = async (req, res, next) => {
  try {
    // Validate dữ liệu đầu vào
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details.map((d) => d.message).join(", "),
      });
    }
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
      // Nếu token hết hạn hoặc không hợp lệ, thử tìm user theo token
      const user = await User.findOne({ emailVerificationToken: token });
      if (
        user &&
        user.emailVerificationTokenExpires &&
        user.emailVerificationTokenExpires < Date.now()
      ) {
        // Tạo token mới và gửi lại email xác thực
        const newToken = jwt.sign({ email: user.email }, jwtConfig.secret, { expiresIn: "15m" });
        user.emailVerificationToken = newToken;
        user.emailVerificationTokenExpires = Date.now() + 15 * 60 * 1000;
        await user.save();
        await sendVerificationEmail(user.email, newToken);
        return res.status(400).json({
          message:
            "Mã xác thực đã hết hạn. Một email xác thực mới đã được gửi, vui lòng kiểm tra email.",
        });
      }
      // Nếu user đã xác thực rồi
      if (user && user.isEmailVerified) {
        return res
          .status(200)
          .json({ message: "Email đã được xác thực trước đó. Bạn có thể đăng nhập." });
      }
      return res.status(400).json({ message: "Token xác thực không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findOne({
      email: payload.email,
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    // Nếu user đã xác thực rồi
    if (user && user.isEmailVerified) {
      return res
        .status(200)
        .json({ message: "Email đã được xác thực trước đó. Bạn có thể đăng nhập." });
    }

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
    // Validate dữ liệu đầu vào
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details.map((d) => d.message).join(", "),
      });
    }
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

    // Cập nhật trạng thái online
    user.status = "online";
    await user.save();

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

    res.status(200).json({
      user: userObj,
      message: "Đăng nhập thành công.",
    });
  } catch (err) {
    next(err);
  }
};

// Đăng xuất: xóa cookie token
exports.logout = async (req, res) => {
  try {
    // Nếu đã xác thực, cập nhật trạng thái offline
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { status: "offline", lastOnline: new Date() });
    }
  } catch (e) {
    // Không cần xử lý lỗi ở đây, tiếp tục đăng xuất
  }
  res.clearCookie("token");
  res.status(200).json({ message: "Đăng xuất thành công" });
};
