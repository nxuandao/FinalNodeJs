const Order = require("../Models/OrderModels");

exports.createOrder = async (req, res) => {
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
