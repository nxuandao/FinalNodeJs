const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ["percent", "fixed"],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  expireAt: {
    type: Date,
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  maxUses: {
  type: Number,
  default: 0   // 0 = không giới hạn
},
orderApplied: {
  type: Number,
  default: 0   // số đơn hàng đã dùng coupon
},

});

module.exports = mongoose.model("Coupon", couponSchema);
