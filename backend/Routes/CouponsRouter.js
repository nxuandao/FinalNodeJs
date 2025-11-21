const express = require("express");
const router = express.Router();
const couponController = require("../Controllers/Coupons"); 
const { ensureAuthenticated } = require("../Middlewares/Auth");

// ======================
// TẠO COUPON
// POST /api/coupons/create
// ======================
router.post("/create", ensureAuthenticated, couponController.createCoupon);

// ======================
// LẤY TẤT CẢ COUPON
// GET /api/coupons
// ======================
router.get("/", couponController.getAllCoupons);

// ======================
// ÁP DỤNG COUPON
// POST /api/coupons/apply
// ======================
router.post("/apply", couponController.applyCoupon);

// ======================
// XÓA COUPON THEO CODE
// DELETE /api/coupons/:code
// ======================
router.delete("/:code", ensureAuthenticated, couponController.deleteCoupon);
router.put("/:code", ensureAuthenticated, couponController.updateCoupon);

module.exports = router;
