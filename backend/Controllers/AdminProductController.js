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
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      brand,
      description,
      producttype,
      price,
      gender,
      images,
      sizes,
      colors,
    } = req.body;

    console.log("📤 Nhận dữ liệu từ frontend:", req.body);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để cập nhật!",
      });
    }

    // Cập nhật thông tin cơ bản
    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (description) product.description = description;
    if (producttype) product.producttype = producttype;
    if (price) product.price = price;
    if (gender) product.gender = gender;
    if (sizes) product.sizes = sizes;
    if (colors) product.colors = colors;


if (Array.isArray(images)) {
  product.images = images;   // Ảnh nào FE gửi → để lại
  product.markModified("images");
  console.log("Final images:", images);
}


    await product.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công!",
      data: product,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật sản phẩm",
      error: error.message,
    });
  }
};





module.exports = {
  getAllProductsAdmin,
  listProducts,
  updateProductQuantity,
  getProductById,
  createProduct,
  updateProductStatus,
  updateProduct, 
};


