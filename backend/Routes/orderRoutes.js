const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../Controllers/orderController");

// Tạo đơn hàng
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.get("/:orderId", getOrderById);

// Lấy đơn hàng của 1 user
router.get("/user/:userId", getMyOrders);
router.put("/:id/status", updateOrderStatus);


// Lấy toàn bộ đơn hàng (dùng cho admin)
router.get("/", getAllOrders);

module.exports = router;
