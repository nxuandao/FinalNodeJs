const express = require("express");
const UserModel = require("../Models/User");
const { authenticateJWT } = require("../Middlewares/AuthValidation");
const { getLoyaltyPoints } = require("../Controllers/AuthController");

const router = express.Router();


router.put("/update/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, addresses, avatar } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    if (Array.isArray(addresses)) {
  user.addresses = addresses;
}

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error(" Update user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${unique}${ext}`);
  },
});
const upload = multer({ storage });


router.post(
  "/upload/avatar",
  authenticateJWT,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const userId = req.user?.id;
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      // Cập nhật avatar cho user trong DB
      if (userId) {
        await UserModel.findByIdAndUpdate(userId, { avatar: avatarUrl });
      }

      res.json({ success: true, avatarUrl });
    } catch (err) {
      console.error("Upload avatar error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);


// Đổi mật khẩu
router.put("/change-password", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing password fields" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const bcrypt = require("bcryptjs");
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(" Change password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//  Lấy thông tin user theo ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(" Get user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/loyalty", getLoyaltyPoints);
module.exports = router;
