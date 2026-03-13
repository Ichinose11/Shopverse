const express = require('express');
const router = express.Router();
const {
  adminGetProducts, createProduct, updateProduct, deleteProduct,
  adminGetOrders, updateOrderStatus, getDashboardStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);

router.get('/products', adminGetProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', adminGetOrders);
router.put('/orders/:id', updateOrderStatus);

module.exports = router;
