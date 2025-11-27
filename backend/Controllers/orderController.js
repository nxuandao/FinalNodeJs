const Order = require("../Models/OrderModels");

const { buildVnpayUrl } = require("../utils/vnpay");

exports.createOrder = async (req, res) => {
  try {
    const data = req.body;

    /* 🚚 SHIPPING */
    let shipFee = 0;
    switch (data.shippingMethod) {
      case "Tiêu Chuẩn":
        shipFee = 30000;
        break;
      case "Hỏa tốc":
        shipFee = 50000;
        break;
      default:
        shipFee = 30000;
    }

    /* 💰 TOTAL PRICE */
    const totalAmount = data.subtotal + shipFee - (data.discount || 0);

    /* PAYMENT STATUS */
    let status = "Chờ xác nhận";

    if (data.paymentMethod === "VNPAY") {
      status = "Chờ xác nhận";
    }

    const order = await Order.create({
      ...data,
      shipFee,
     total: totalAmount, 
      status,
    });

    /* 🔗 VNPay */
   if (data.paymentMethod === "VNPAY") {
   const payUrl = buildVnpayUrl(order._id.toString(), totalAmount);

   return res.json({
     success: true,
     payUrl,
     orderId: order._id
   });
}



    /* 💵 COD hoặc Momo (chưa tích hợp) */
    return res.json({
      success: true,
      data: order,
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi tạo đơn hàng!",
      error: err.message,
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

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
      error: err.message,
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
