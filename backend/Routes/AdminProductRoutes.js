const express = require("express");
const { getAllProductsAdmin, updateProductQuantity, listProducts } = require("../Controllers/AdminProductController.js");


const router = express.Router();
router.route('/products')
  .get(getAllProductsAdmin);

router.route('/products/paginated')
  .get(listProducts);

router.route('/products/:id/quantity')
  .put(updateProductQuantity);

module.exports = router;