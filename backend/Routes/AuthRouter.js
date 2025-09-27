const express = require("express");
const crypto = require("crypto");
const { signupValidation, loginValidation } = require("../Middlewares/AnthValidation");
const { signup, login, forgotPassword, resetPassword } = require("../Controllers/AuthController");
const UserModel = require("../Models/User");
const { sendVerificationEmail } = require("../utils/email"); 

const router = express.Router();

// Xác minh email
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    // Tìm user theo token
    const user = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.log("Token từ query:", req.query.token);
      console.log("Token trong DB:", user?.verificationToken);
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    // Cập nhật trạng thái đã xác minh
    user.isVerified = true;
    user.verifyToken = undefined; // Xóa token để tránh dùng lại
    await user.save();

    return res.send("Xác minh email thành công! Bạn có thể đăng nhập.");
    // return res.redirect(`${process.env.FRONTEND_URL}/verify-success`);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Có lỗi xảy ra.");
  }
});

// module.exports = router;

// Khi người dùng click link trong email
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    // Redirect sang frontend hiển thị form đổi mật khẩu
    return res.redirect(`${process.env.FRONTEND_URL}/reset-password/${req.params.token}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Có lỗi xảy ra");
  }
});

// Khi người dùng submit mật khẩu mới
router.post("/reset-password/:token", resetPassword);

// ------------------ Auth ------------------
router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

// Export 1 lần duy nhất
module.exports = router;
