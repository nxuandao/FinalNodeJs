const express = require("express");
const router = express.Router();
const couponController = require("../Controllers/Coupons"); 
const { ensureAuthenticated } = require("../Middlewares/Auth");


router.post("/create", ensureAuthenticated, couponController.createCoupon);


router.get("/", couponController.getAllCoupons);


router.post("/apply", couponController.applyCoupon);


router.delete("/:code", ensureAuthenticated, couponController.deleteCoupon);
router.put("/:code", ensureAuthenticated, couponController.updateCoupon);

module.exports = router;
