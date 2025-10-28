// Models/Product.js
const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });
const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        slug: { type: String, trim: true },
        sku: { type: String, trim: true, index: true },

        // Lưu 1 màu duy nhất hoặc nhiều màu đều được:
        color: { type: String, trim: true, index: true },
        colors: [{ type: String, trim: true, index: true }],
        sizes: [{ type: String, trim: true }],

        // Đơn giản dùng chuỗi category; nếu bạn có bảng riêng thì đổi sang ObjectId + ref
        category: { type: String, trim: true, index: true },

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
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });

module.exports = mongoose.model('Product', ProductSchema, 'product');
