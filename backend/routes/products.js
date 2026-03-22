const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createReview, getCategories } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, createReview);

module.exports = router;
