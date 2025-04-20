module.exports = {
  secret: process.env.JWT_SECRET || "your_jwt_secret", // JWT secret key
  expiresIn: "7d", // Token expiry
};
