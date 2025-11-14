const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ Lỗi: MONGO_URI không tồn tại! Hãy kiểm tra lại file .env");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
