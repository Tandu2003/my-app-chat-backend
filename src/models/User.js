const mongoose = require("mongoose");
const { hashPassword } = require("../utils/bcrypt");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Họ và tên người dùng
  bio: { type: String }, // Tiểu sử
  gender: { type: String }, // Giới tính
  birthday: { type: Date }, // Ngày sinh
  email: { type: String, unique: true, required: true }, // Email người dùng
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.facebookId;
    },
  }, // Mật khẩu người dùng
  isEmailVerified: { type: Boolean, default: false }, // Đã xác thực email chưa
  googleId: { type: String }, // Đăng nhập Google
  facebookId: { type: String }, // Đăng nhập Facebook
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách bạn bè
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest" }], // Lời mời kết bạn
  groupChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }], // Các nhóm chat đã tham gia
  groupInvites: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupInvite" }], // Lời mời tham gia nhóm
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người dùng bị chặn
  status: { type: String, enum: ["online", "offline"], default: "offline" }, // Trạng thái online/offline
  lastOnline: { type: Date }, // Thời gian online cuối cùng
  createdAt: { type: Date, default: Date.now }, // Thời gian tạo tài khoản
  emailVerificationToken: { type: String }, // Token xác thực email
  passwordChangedAt: { type: Date }, // Thời điểm đổi mật khẩu cuối cùng
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await hashPassword(this.password);
    this.passwordChangedAt = new Date(); // cập nhật thời điểm đổi mật khẩu
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
