const Order = require("../Models/OrderModels");
const User = require("../Models/User");

const { buildVnpayUrl } = require("../utils/vnpay");

exports.createOrder = async (req, res) => {
  try {
    const data = req.body;

    // ===== 1. LẤY USER =====
    const user = await User.findById(data.userId);
    if (!user) {
      return res.json({ success: false, message: "User không tồn tại!" });
    }

    // ===== 2. TÍNH PHÍ SHIP =====
    let shipFee = data.shippingMethod === "Hỏa tốc" ? 50000 : 30000;

    // ===== 3. XỬ LÝ ĐIỂM =====
    const POINT_RATE = 1000;
    const userPoints = user.loyaltyPoints || 0;

    const pointsToUse = Math.min(
      Math.max(data.useLoyaltyPoints || 0, 0),
      userPoints
    );

    const loyaltyUsedValue = pointsToUse * POINT_RATE;

    // ===== 4. LẤY GIÁ TRỊ CLIENT GỬI LÊN =====
    const subtotal = Number(data.subtotal || 0);
    const discount = Number(data.discount || 0);

    // ===== 5. TÍNH TOTAL ĐÚNG CHUẨN =====
    const totalAmount =
      subtotal + shipFee - discount - loyaltyUsedValue;

    if (totalAmount < 0) {
      return res.json({
        success: false,
        message: "Điểm sử dụng vượt quá giá trị đơn hàng!"
      });
    }

    // ===== 6. TẠO ĐƠN =====
    const order = await Order.create({
      ...data,
      shipFee,
      subtotal,
      discount,
      loyaltyUsed: pointsToUse,
      loyaltyUsedValue,
      total: totalAmount,
      status: "Chờ xác nhận"
    });

    // ===== 7. TRỪ ĐIỂM USER =====
    user.loyaltyPoints = userPoints - pointsToUse;
    await user.save();

    // ===== 8. THANH TOÁN VNPAY =====
    if (data.paymentMethod === "VNPAY") {
      const payUrl = buildVnpayUrl(order._id.toString(), totalAmount);

      return res.json({
        success: true,
        payUrl,
        orderId: order._id,
        user
      });
    }

    // ===== 9. TRẢ VỀ CHO COD =====
    return res.json({
      success: true,
      data: order,
      user
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi tạo đơn hàng!",
      error: err.message
    });
  }
};


// Controllers/orderController.js

exports.getOrderStats = async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;

    const completedOrders = orders.filter(
      o => o.status === "Đã giao"
    ).length;

    const revenue = orders
      .filter(o => o.status === "Đã giao")
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        revenue
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi thống kê",
    });
  }
};



exports.createOrderr = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    res.json({
      success: true,
      message: "Tạo đơn hàng thành công!",
      data: order,
    });
  } catch (err) {
    console.log("BODY RECEIVED FROM CLIENT:", req.body);

     console.error(" CREATE ORDER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi tạo đơn hàng!",
      error: err.message,
    });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("GET ORDER BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Tìm đơn
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!"
      });
    }

    // Nếu đổi từ trạng thái khác → Đã giao
    const isNewDelivered =
      status === "Đã giao" &&
      order.status !== "Đã giao";

    // Cập nhật trạng thái
    order.status = status;
    await order.save();

    //CỘNG ĐIỂM CHỈ KHI CHUYỂN SANG “Đã giao”
    if (isNewDelivered) {
      const User = require("../Models/User");
      const user = await User.findById(order.userId);

      if (user) {
        const earnedPoints = Math.floor(order.total / 10000);

        user.loyaltyPoints = (user.loyaltyPoints || 0) + earnedPoints;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order,
    });

  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
};


exports.updateOrderStatuss = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không lấy được đơn hàng!",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Không lấy được danh sách đơn hàng!",
    });
  }
};
