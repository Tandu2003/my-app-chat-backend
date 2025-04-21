const mongoose = require("mongoose");
const { hashPassword } = require("../utils/bcrypt");

/**
 * UserSchema fields:
 * - fullName: Họ và tên người dùng
 * - bio: Tiểu sử
 * - gender: Giới tính
 * - birthday: Ngày sinh
 * - email: Email người dùng (duy nhất)
 * - password: Mật khẩu người dùng (có thể không cần nếu đăng nhập MXH)
 * - isEmailVerified: Đã xác thực email chưa
 * - googleId: Đăng nhập Google
 * - facebookId: Đăng nhập Facebook
 * - friends: Danh sách bạn bè (User[])
 * - friendRequests: Lời mời kết bạn nhận được (FriendRequest[])
 * - sentFriendRequests: Lời mời kết bạn đã gửi (FriendRequest[])
 * - groupChats: Các nhóm chat đã tham gia (GroupChat[])
 * - groupInvites: Lời mời tham gia nhóm (GroupInvite[])
 * - blockedUsers: Danh sách người dùng bị chặn (User[])
 * - status: Trạng thái online/offline
 * - lastOnline: Thời gian online cuối cùng
 * - createdAt: Thời gian tạo tài khoản
 * - emailVerificationToken: Token xác thực email
 * - emailVerificationTokenExpires: Thời hạn token xác thực email
 * - passwordChangedAt: Thời điểm đổi mật khẩu cuối cùng
 */
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  bio: { type: String },
  gender: { type: String },
  birthday: { type: Date },
  email: { type: String, unique: true, required: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.facebookId;
    },
  },
  isEmailVerified: { type: Boolean, default: false },
  googleId: { type: String },
  facebookId: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest" }],
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest" }],
  groupChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }],
  groupInvites: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupInvite" }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  lastOnline: { type: Date },
  createdAt: { type: Date, default: Date.now },
  emailVerificationToken: { type: String },
  emailVerificationTokenExpires: { type: Date },
  passwordChangedAt: { type: Date },
});

UserSchema.pre("save", async function (next) {
  // Mã hóa mật khẩu trước khi lưu vào DB
  if (this.isModified("password") && this.password) {
    this.password = await hashPassword(this.password);
    this.passwordChangedAt = new Date();
  }
  // Cập nhật lastOnline nếu status chuyển thành offline
  if (this.isModified("status") && this.status === "offline") {
    this.lastOnline = new Date();
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
