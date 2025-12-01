const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const config = require("../config/vnpayconfig");

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((k) => (sorted[k] = obj[k]));
  return sorted;
}

exports.buildVnpayUrl = (orderId, amount) => {
  const date = new Date();

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: moment(date).format("YYYYMMDDHHmmss"),
    vnp_OrderInfo: `order_${orderId}`,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: config.vnp_ReturnUrl, 
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: moment(date).format("YYYYMMDDHHmmss")
  };

  // Sort params theo alphabet
  vnp_Params = sortObject(vnp_Params);

  // Create sign data
  const signData = qs.stringify(vnp_Params, { encode: false });

  const secureHash = crypto
    .createHmac("sha512", config.vnp_HashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  vnp_Params["vnp_SecureHash"] = secureHash;

  // Log để debug nếu cần
  console.log(" PARAMS SENT TO VNPAY:", vnp_Params);
  console.log(" SIGN DATA:", signData);
  console.log(" HASH SEND:", secureHash);

  return (
    config.vnp_Url +
    "?" +
    qs.stringify(vnp_Params, { encode: true })
  );
};
