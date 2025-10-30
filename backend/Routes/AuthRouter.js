const express = require("express");
const crypto = require("crypto");
const { signupValidation, loginValidation } = require("../Middlewares/AuthValidation");
const { signup, login, forgotPassword, resetPassword } = require("../Controllers/AuthController");
const UserModel = require("../Models/User");
const { sendVerificationEmail } = require("../utils/email"); 
const { authenticateJWT, authorizeRoles } = require("../Middlewares/AuthValidation");

const router = express.Router();

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.log("Token từ query:", req.query.token);
      console.log("Token trong DB:", user?.verificationToken);
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    return res.send("Xác minh email thành công! Bạn có thể đăng nhập.");

  } catch (err) {
    console.error(err);
    return res.status(500).send("Có lỗi xảy ra.");
  }
});


router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      resetToken: req.params.token,
      resetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    return res.redirect(`${process.env.FRONTEND_URL}/reset-password/${req.params.token}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Có lỗi xảy ra");
  }
});

router.post("/reset-password/:token", resetPassword);

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/homeAdmin", authenticateJWT, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});
router.post("/forgot-password", forgotPassword);

module.exports = router;
