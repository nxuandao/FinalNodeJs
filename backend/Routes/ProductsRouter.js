// Routes/ProductsRouter.js
const router = require('express').Router();
const { ensureAuthenticated } = require('../Middlewares/Auth.js');
const { listProducts, getProductById, addReview, deleteReview} = require('../Controllers/ProductsController');

router.get('/secure-demo', ensureAuthenticated, (req, res) => {
  console.log('------logged in user detail------', req.user);
  res.status(200).json([
    {
      name: "shirt",
      price: 20,
      ok: true,
      user: req.user
    }
  ]);
});
router.delete('/:id/reviews/delete', ensureAuthenticated, deleteReview);

router.get('/', listProducts);
router.get('/:id', getProductById);
router.get('/secure', ensureAuthenticated, listProducts);
router.post('/:id/reviews', ensureAuthenticated, addReview);
module.exports = router;
