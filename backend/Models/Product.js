// Models/Product.js
const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });
const SizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
}, { _id: false });
const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        slug: { type: String, trim: true },
        sku: { type: String, trim: true, index: true },
        brand: { type: String, trim: true },
       
        colors: [{ type: String, trim: true, index: true }],
        sizes: { type: [SizeSchema], default: [] },

       producttype: { type: String, trim: true, index: true },
        gender: { type: String, trim: true, enum: ["Nam", "Nữ", "Unisex"], default: "Unisex" },

        price: { type: Number, default: 0 },
        description: { type: String, default: '' },
        images: [{ type: String }],

        isActive: { type: Boolean, default: true },
        stock: { type: Number, default: 0 },
        reviews: { type: [ReviewSchema], default: [] }
    },
    { timestamps: true }
);

// Index hỗ trợ tìm kiếm nhanh
ProductSchema.index({ name: 'text', description: 'text' }); // Tìm theo tên/ mô tả
ProductSchema.index({ color: 1 });
ProductSchema.index({ colors: 1 });
ProductSchema.index({ producttype: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ gender: 1 });


module.exports = mongoose.model('Product', ProductSchema, 'product');
