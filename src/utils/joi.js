const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Họ và tên không được để trống",
    "string.min": "Họ và tên phải có ít nhất 2 ký tự",
    "string.max": "Họ và tên tối đa 50 ký tự",
    "any.required": "Họ và tên là bắt buộc",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "Mật khẩu không được để trống",
    "string.min": "Mật khẩu tối thiểu 6 ký tự",
    "string.max": "Mật khẩu tối đa 100 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email không được để trống",
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "Mật khẩu không được để trống",
    "string.min": "Mật khẩu tối thiểu 6 ký tự",
    "string.max": "Mật khẩu tối đa 100 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
