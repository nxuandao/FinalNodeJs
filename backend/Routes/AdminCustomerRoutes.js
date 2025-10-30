const express = require("express");
const { getAllCustomers, updateCustomerStatus } = require("../Controllers/AdminCustomersController");

const router = express.Router();


router.route('/customers')
  .get(getAllCustomers);

router.route('/customers/:id/status')
  .put(updateCustomerStatus);

module.exports = router;