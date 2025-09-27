const { ensureAuthenticated } = require('../Middlewares/Auth.js');


const router = require('express').Router();


router.get('/', ensureAuthenticated, (req, res) => {
  console.log('------logged in user detail------', req.user);
  res.status(200).json([
    {
        name: "shirt",
        price: 20,
    }
  ])
});
module.exports = router;