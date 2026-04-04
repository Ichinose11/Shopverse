const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build query
  const query = { isActive: true };

  if (req.query.category) query.category = req.query.category;
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.featured === 'true') query.featured = true;
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Sort
  let sort = { createdAt: -1 };
  if (req.query.sort === 'price_asc') sort = { price: 1 };
  if (req.query.sort === 'price_desc') sort = { price: -1 };
  if (req.query.sort === 'rating') sort = { rating: -1 };
  if (req.query.sort === 'newest') sort = { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'reviews.user',
    'name avatar'
  );

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.updateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, data: categories });
});

module.exports = { getProducts, getProduct, createReview, getCategories };
