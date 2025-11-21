const Coupon = require("../Models/CouponsModel");

// ======================
// CREATE COUPON
// ======================
exports.createCoupon = async (req, res) => {
  try {
const { code, discountType, discountValue, expireAt, maxUses } = req.body;

    if (!code || !discountType || !discountValue || !expireAt) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu coupon!"
      });
    }

    const exist = await Coupon.findOne({ code: code.toUpperCase() });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Coupon đã tồn tại!"
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expireAt,
      maxUses: maxUses ?? 0,
    });

    return res.json({
      success: true,
      data: coupon,
      message: "Tạo coupon thành công!"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server!",
      error: err.message
    });
  }
};

// ======================
// GET ALL COUPONS
// ======================
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: coupons
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không lấy được danh sách coupon!"
    });
  }
};

// ======================
// APPLY COUPON
// ======================
// ======================
// APPLY COUPON (FINAL)
// ======================
exports.applyCoupon = async (req, res) => {
  try {
    const { code, total } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa nhập mã coupon!"
      });
    }

    if (total <= 0) {
      return res.status(400).json({
        success: false,
        message: "Tổng tiền không hợp lệ!"
      });
    }

    // Tìm coupon, kiểm tra hạn
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Mã coupon không tồn tại!"
      });
    }

    // Kiểm tra hết hạn
    if (new Date() > new Date(coupon.expireAt)) {
      return res.status(400).json({
        success: false,
        message: "Mã coupon đã hết hạn!"
      });
    }

    // Kiểm tra số lần dùng
    if (coupon.maxUses > 0 && coupon.orderApplied >= coupon.maxUses) {
      return res.status(400).json({
        success: false,
        message: "Mã coupon đã hết lượt sử dụng!"
      });
    }

    // TÍNH GIẢM GIÁ
    let discount = 0;

    if (coupon.discountType === "percent") {
      discount = Math.floor((total * coupon.discountValue) / 100);
    } else if (coupon.discountType === "fixed") {
      discount = coupon.discountValue;
    }

    if (discount <= 0) discount = 0;

    const finalTotal = Math.max(0, total - discount);

    // Tăng số lần dùng
    coupon.orderApplied = (coupon.orderApplied || 0) + 1;
    await coupon.save();

    return res.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      code: coupon.code,
      discount,
      finalTotal,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      remainingUses:
        coupon.maxUses > 0 ? coupon.maxUses - coupon.orderApplied : "∞"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi áp dụng coupon!",
      error: err.message
    });
  }
};


// ======================
// DELETE COUPON
// ======================
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndDelete({
      code: req.params.code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon không tồn tại!"
      });
    }

    res.json({
      success: true,
      message: "Xóa coupon thành công!"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa coupon!"
    });
  }
};
exports.updateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const { discountType, discountValue, expireAt, maxUses } = req.body;

    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        discountType,
        discountValue,
        expireAt,
        maxUses: maxUses ?? 0
      },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy coupon!"
      });
    }

    return res.json({
      success: true,
      message: "Cập nhật coupon thành công!",
      data: coupon
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server!",
      error: err.message
    });
  }
};

