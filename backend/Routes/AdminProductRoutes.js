const express = require("express");
const Product = require("../Models/Product"); // ✅ thêm dòng này

const {
  getAllProductsAdmin,
  listProducts,
  updateProductQuantity,
  getProductById,
  createProduct,
  updateProductStatus,
  updateProduct
} = require("../Controllers/AdminProductController.js");

const router = express.Router();

// 🧩 Lấy danh sách + Thêm sản phẩm mới
router.route("/products")
  .get(getAllProductsAdmin)
  .post(createProduct);

// 🧩 Phân trang
router.route("/products/paginated")
  .get(listProducts);

// 🧩 Lấy chi tiết + Cập nhật sản phẩm
router.route("/products/:id")
  .get(getProductById)
  .put(updateProduct); // ✅ Sửa chỗ này: dùng updateProduct để edit

// 🧩 Cập nhật tồn kho
router.route("/products/:id/quantity")
  .put(updateProductQuantity);

// 🧩 Cập nhật trạng thái (bật/tắt)
router.route("/products/:id/status")
  .put(updateProductStatus);

router.put("/:id/remove-image", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $pull: { images: imageUrl } },
      { new: true }
    );

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router.put("/:id/add-images", async (req, res) => {
  try {
    const { images } = req.body; // mảng link Cloudinary mới

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: images } } },
      { new: true }
    );

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
