const Order = require("../Models/OrderModels");
const User = require("../Models/User");
const { sendEmail } = require("../utils/email"); 


const { buildVnpayUrl } = require("../utils/vnpay");

exports.createOrder = async (req, res) => {
  try {
    const data = req.body;

  
    const user = await User.findById(data.userId);
    if (!user) {
      return res.json({ success: false, message: "User không tồn tại!" });
    }

  
    let shipFee = data.shippingMethod === "Hỏa tốc" ? 50000 : 30000;

    
    const POINT_RATE = 1000;
    const userPoints = user.loyaltyPoints || 0;

    const pointsToUse = Math.min(
      Math.max(data.useLoyaltyPoints || 0, 0),
      userPoints
    );

    const loyaltyUsedValue = pointsToUse * POINT_RATE;

   
    const subtotal = Number(data.subtotal || 0);
    const discount = Number(data.discount || 0);

   
    const totalAmount =
      subtotal + shipFee - discount - loyaltyUsedValue;

    if (totalAmount < 0) {
      return res.json({
        success: false,
        message: "Điểm sử dụng vượt quá giá trị đơn hàng!"
      });
    }

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
  
try {
  const userEmail = user.email;

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 8px;border:1px solid #ccc;">${item.name}</td>
          <td style="padding:6px 8px;border:1px solid #ccc;text-align:center;">${item.qty}</td>
          <td style="padding:6px 8px;border:1px solid #ccc;">${item.priceVND.toLocaleString()}đ</td>
          <td style="padding:6px 8px;border:1px solid #ccc;">${(item.priceVND * item.qty).toLocaleString()}đ</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <h2>🎉 Đặt hàng thành công!</h2>
    <p>Xin chào <b>${user.name}</b>, cảm ơn bạn đã mua hàng tại <b>OurShop</b>.</p>
    
    <h3>Mã đơn hàng: <b>${order.code}</b></h3>

    <table style="border-collapse:collapse;width:100%;margin-top:10px;">
      <thead>
        <tr>
          <th style="border:1px solid #ccc;padding:8px;">Sản phẩm</th>
          <th style="border:1px solid #ccc;padding:8px;">SL</th>
          <th style="border:1px solid #ccc;padding:8px;">Giá</th>
          <th style="border:1px solid #ccc;padding:8px;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <h3 style="margin-top:16px;">Tổng thanh toán: 
      <span style="color:red;">${order.total.toLocaleString()}đ</span>
    </h3>

    <p>Chúng tôi sẽ liên hệ với bạn khi đơn hàng được giao cho đơn vị vận chuyển.</p>
    <p>Cảm ơn bạn đã tin tưởng đặt hàng ❤️</p>
  `;

  await sendEmail(userEmail, "Xác nhận đơn hàng thành công", html);

  console.log("📩 Email xác nhận đã gửi đến:", userEmail);

} catch (emailErr) {
  console.error("❌ Lỗi gửi email:", emailErr);
}


   
    user.loyaltyPoints = userPoints - pointsToUse;
    await user.save();

   
    if (data.paymentMethod === "VNPAY") {
      const payUrl = buildVnpayUrl(order._id.toString(), totalAmount);

      return res.json({
        success: true,
        payUrl,
        orderId: order._id,
        user
      });
    }
  
  
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
