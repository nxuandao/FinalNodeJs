const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  line: String,
  ward: String,
  district: String,
  city: String,
  phone: String,
  label: String,
});

const ContactSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
});

const ItemSchema = new mongoose.Schema({
  id: String,
  sku: String,
  name: String,
  img: String,
  priceVND: Number,
  qty: Number,
  size: String,
  color: String,
});

const OrderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [ItemSchema],

    contact: ContactSchema,

    address: AddressSchema,
    voucherCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    loyaltyUsed: { type: Number, default: 0 },     // Điểm user đã dùng
loyaltyEarned: { type: Number, default: 0 },   // Điểm user nhận được

    shippingMethod: String,
    paymentMethod: String,
    status: {
  type: String,
  enum: ["Chờ xác nhận", "Chuẩn bị hàng", "Đang vận chuyển", "Đã giao", "Đã hủy"],
  default: "Chờ xác nhận"
},

    subtotal: Number,
    shipFee: Number,
    total: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
