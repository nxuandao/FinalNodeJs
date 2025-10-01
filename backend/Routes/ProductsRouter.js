// Routes/ProductsRouter.js
const router = require('express').Router();
const { ensureAuthenticated } = require('../Middlewares/Auth.js');
const { listProducts } = require('../Controllers/ProductsController');

// ✅ Public: tìm kiếm sản phẩm – ai cũng truy cập được
router.get('/', listProducts);

// (tuỳ chọn) ✅ Protected demo: chỉ ai đăng nhập mới vào được
router.get('/secure-demo', ensureAuthenticated, (req, res) => {
  console.log('------logged in user detail------', req.user);
  res.status(200).json([
    {
      name: "shirt",
      price: 20,
    }
  ]);
});

router.get('/secure', ensureAuthenticated, listProducts);

module.exports = router;
