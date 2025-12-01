const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const qs = require("qs");
const config = require("../config/vnpayconfig");
const Order = require("../Models/OrderModels");

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((k) => (sorted[k] = obj[k]));
  return sorted;
}

router.get("/vnpay_return", async (req, res) => {
  let vnp_Params = { ...req.query };

  console.log("🔵 RAW QUERY FROM VNPAY:", vnp_Params);

  const secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  // decode params
  Object.keys(vnp_Params).forEach((key) => {
    vnp_Params[key] = decodeURIComponent(vnp_Params[key]).replace(/\+/g, " ");
  });

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const signed = crypto
    .createHmac("sha512", config.vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  console.log("AFTER REMOVE HASH:", vnp_Params);
  console.log("SIGN DATA CHECK:", signData);
  console.log("HASH CHECK:", signed);
  console.log("HASH RECEIVED:", secureHash);

  if (secureHash !== signed) {
    console.log("Sai chữ ký!");
    return res.redirect("http://localhost:3000/payment-failed");
  }

  const responseCode = vnp_Params["vnp_ResponseCode"];
  const orderId = vnp_Params["vnp_OrderInfo"].replace("order_", "");

  if (responseCode === "00") {
    await Order.findByIdAndUpdate(orderId, { status: "Đã thanh toán" });
    return res.redirect("http://localhost:3000/payment-success");
  }

  await Order.findByIdAndUpdate(orderId, { status: "Thanh toán thất bại" });
  return res.redirect("http://localhost:3000/payment-failed");
});

module.exports = router;
