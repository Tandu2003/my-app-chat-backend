const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const db = require("./config/db");

// Thêm các middleware mới
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

dotenv.config();
db.connect();

const app = express();

// Middleware bảo mật HTTP headers
app.use(helmet());

// Middleware log request
app.use(morgan("dev"));

// Middleware cho phép CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Middleware parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// Middleware xử lý lỗi tổng quát
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
