const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  signupValidation,
  loginValidation,
  authenticateJWT,
  authorizeRoles,
} = require("../Middlewares/AuthValidation");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require("../Controllers/AuthController");
const UserModel = require("../Models/User");
const { sendVerificationEmail } = require("../utils/email");

const router = express.Router();

/* ========== VERIFY EMAIL ========== */
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Token từ query:", req.query.token);
      console.log("Không tìm thấy user hoặc token hết hạn");
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return res.send("Xác minh email thành công! Bạn có thể đăng nhập.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Có lỗi xảy ra.");
  }
});

/* ========== RESET PASSWORD ========== */
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      resetToken: req.params.token,
      resetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/reset-password/${req.params.token}`
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("Có lỗi xảy ra");
  }
});

router.post("/reset-password/:token", resetPassword);

/* AUTH CORE */
router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPassword);



// Lấy toàn bộ lịch sử đăng nhập (giới hạn 50 bản ghi — do backend đã slice)
router.get("/login-history", authenticateJWT, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("activity_log");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng"
      });
    }

    return res.json({
      success: true,
      history: user.activity_log.reverse() // đảo ngược: mới → cũ
    });
  } catch (err) {
    console.error(" Error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
});


// Lấy chi tiết 1 lần đăng nhập
router.get("/login-history/:logId", authenticateJWT, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("activity_log");

    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    const log = user.activity_log.id(req.params.logId);

    if (!log)
      return res.status(404).json({ success: false, message: "Không tìm thấy log tương ứng" });

    return res.json({
      success: true,
      detail: log
    });
  } catch (err) {
    console.error(" Error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
});

/* ========== ADMIN DEMO ========== */
router.get(
  "/homeAdmin",
  authenticateJWT,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);


router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const payload = req.user; // do middleware authenticateJWT gán
    const user = await UserModel.findById(payload.id).select(
      "_id name email role isVerified"
    );

    if (!user) {
      return res
        .status(404)
        .json({ authenticated: false, message: "Không tìm thấy người dùng" });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      authenticated: false,
      message: "Lỗi máy chủ",
    });
  }
});


router.get("/status", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ authenticated: true, user: decoded });
  } catch {
    return res.json({ authenticated: false });
  }
});

module.exports = router;
