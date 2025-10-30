const Product = require('../Models/Product');

const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Product.countDocuments();
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params; 
    const { size, stockQuantity } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const sizeIndex = product.sizes.findIndex((s) => s.size === size);
    if (sizeIndex === -1) {
      return res.status(404).json({ success: false, message: `Size '${size}' not found in this product` });
    }

    product.sizes[sizeIndex].stockQuantity = stockQuantity;

    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product quantity:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = {
  getAllProductsAdmin,
  listProducts,
  updateProductQuantity
};