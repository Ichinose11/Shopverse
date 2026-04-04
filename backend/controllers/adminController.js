const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

// @desc    Get all products (including inactive)
// @route   GET /api/admin/products
const adminGetProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const [products, total] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(),
  ]);
  res.json({ success: true, data: products, pagination: { page, limit, total } });
});

// @desc    Create product
// @route   POST /api/admin/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, data: product });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/admin/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, message: 'Product deactivated' });
});

// ─── ORDERS ──────────────────────────────────────────────────────────────────

// @desc    Get all orders
// @route   GET /api/admin/orders
const adminGetOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const query = {};
  if (req.query.status) query.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total } });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status,
      ...(status === 'Delivered' ? { isDelivered: true, deliveredAt: new Date() } : {}),
    },
    { new: true }
  );
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json({ success: true, data: order });
});

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

// @desc    Admin dashboard summary stats
// @route   GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    revenueAgg,
    statusBreakdown,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Product.find({ stock: { $lt: 10 }, isActive: true })
      .select('name stock category')
      .limit(5),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: revenueAgg[0]?.total || 0,
      statusBreakdown: statusBreakdown.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      lowStock,
      recentOrders,
    },
  });
});

module.exports = {
  adminGetProducts, createProduct, updateProduct, deleteProduct,
  adminGetOrders, updateOrderStatus, getDashboardStats,
};
