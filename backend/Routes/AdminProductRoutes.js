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

router.route("/products")
  .get(getAllProductsAdmin)
  .post(createProduct);


router.route("/products/paginated")
  .get(listProducts);

router.route("/products/:id")
  .get(getProductById)
  .put(updateProduct); 

router.route("/products/:id/quantity")
  .put(updateProductQuantity);


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
