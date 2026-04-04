const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create order + Stripe payment intent
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Validate stock and fetch live prices (prevents price manipulation)
  const productIds = orderItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });

  let itemsPrice = 0;
  const validatedItems = orderItems.map((item) => {
    const product = products.find((p) => p._id.toString() === item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}"`);
    }
    const linePrice = product.price * item.quantity;
    itemsPrice += linePrice;
    return {
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
    };
  });

  const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
  const taxPrice = parseFloat((itemsPrice * 0.1).toFixed(2));
  const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  // Create Stripe payment intent (server-side only — card data never touches our server)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100), // cents
    currency: 'usd',
    metadata: {
      userId: req.user._id.toString(),
      userEmail: req.user.email,
    },
  });

  const order = await Order.create({
    user: req.user._id,
    orderItems: validatedItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'stripe',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    stripePaymentIntentId: paymentIntent.id,
  });

  res.status(201).json({
    success: true,
    data: {
      order,
      clientSecret: paymentIntent.client_secret,
    },
  });
});

// @desc    Get logged-in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'name images');

  res.json({ success: true, data: orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Customers can only view their own orders
  if (
    req.user.role !== 'admin' &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({ success: true, data: order });
});

module.exports = { createOrder, getMyOrders, getOrder };
