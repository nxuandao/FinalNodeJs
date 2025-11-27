const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderStatuss,
  getOrderStats,
} = require("../Controllers/orderController");
router.get("/stats/all", getOrderStats);
// Tạo đơn hàng
router.post("/", createOrder);

//router.get("/:orderId", getOrderById);

// Lấy đơn hàng của 1 user
router.get("/user/:userId", getMyOrders);
router.put("/update-status/:id", updateOrderStatuss);
router.put("/:id/status", updateOrderStatus);


// Lấy toàn bộ đơn hàng (dùng cho admin)
router.get("/", getAllOrders);

router.get("/:id", getOrderById);
module.exports = router;
