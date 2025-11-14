// Routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// ✅ route này là /admin/upload
// ✅ Routes/uploadRoutes.js
router.post("/upload/multiple", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Không có ảnh tải lên!" });
    }

    const urls = req.files.map((f) => f.path);
    res.json({ success: true, images: urls });
  } catch (err) {
    console.error("❌ Upload nhiều ảnh lỗi:", err);
    res.status(500).json({ success: false, message: "Upload nhiều ảnh thất bại!" });
  }
});


module.exports = router;
