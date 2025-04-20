require("dotenv").config();
const nodemailer = require("nodemailer");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@mychatapp.com";

const transporter = nodemailer.createTransport({
  // Sử dụng cấu hình SMTP của bạn hoặc dịch vụ như Gmail, Mailgun, v.v.
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async function sendVerificationEmail(email, token) {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: "Xác thực tài khoản My Chat App",
    html: `
      <p>Chào bạn,</p>
      <p>Vui lòng xác thực tài khoản của bạn bằng cách nhấn vào liên kết bên dưới. Liên kết này chỉ có hiệu lực trong 15 phút.</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};
