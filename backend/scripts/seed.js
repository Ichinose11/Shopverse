require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const users = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'Admin1234!',
    role: 'admin',
  },
  {
    name: 'Jane Shopper',
    email: 'jane@example.com',
    password: 'Password123!',
    role: 'customer',
  },
];

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with 30-hour battery life, adaptive noise cancellation, and Hi-Res Audio certification. Features multipoint connection for up to 2 devices simultaneously.',
    price: 299.99,
    originalPrice: 399.99,
    category: 'Electronics',
    brand: 'SoundCore',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', alt: 'Wireless headphones' }],
    stock: 45,
    featured: true,
    rating: 4.7,
    numReviews: 128,
    tags: ['headphones', 'wireless', 'audio', 'noise cancelling'],
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'TKL mechanical keyboard with Cherry MX Red switches, per-key RGB backlighting, and aircraft-grade aluminum construction. N-key rollover with 1000Hz polling rate.',
    price: 149.99,
    category: 'Electronics',
    brand: 'KeyForge',
    images: [{ url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600', alt: 'Gaming keyboard' }],
    stock: 30,
    featured: true,
    rating: 4.5,
    numReviews: 89,
    tags: ['keyboard', 'gaming', 'mechanical', 'RGB'],
  },
  {
    name: 'Ultrawide 4K Monitor 34"',
    description: '34-inch ultrawide curved monitor with 4K resolution (3440x1440), 144Hz refresh rate, 1ms response time, and HDR600 support. USB-C 90W charging included.',
    price: 849.99,
    originalPrice: 999.99,
    category: 'Electronics',
    brand: 'ViewPro',
    images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600', alt: '4K Monitor' }],
    stock: 12,
    featured: false,
    rating: 4.8,
    numReviews: 56,
    tags: ['monitor', '4K', 'ultrawide', 'gaming'],
  },
  {
    name: 'Minimalist Leather Jacket',
    description: 'Genuine full-grain leather jacket with a clean, minimal silhouette. YKK zippers, quilted lining, and a classic biker cut that ages beautifully.',
    price: 349.99,
    category: 'Clothing',
    brand: 'RawEdge',
    images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', alt: 'Leather jacket' }],
    stock: 20,
    featured: true,
    rating: 4.6,
    numReviews: 43,
    tags: ['jacket', 'leather', 'fashion', 'outerwear'],
  },
  {
    name: 'Premium Yoga Mat',
    description: 'Non-slip, eco-friendly natural rubber yoga mat. 6mm thickness for joint support, alignment guides printed in non-toxic ink, includes carrying strap.',
    price: 89.99,
    category: 'Sports',
    brand: 'FlowFit',
    images: [{ url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600', alt: 'Yoga mat' }],
    stock: 75,
    featured: false,
    rating: 4.4,
    numReviews: 212,
    tags: ['yoga', 'fitness', 'mat', 'wellness'],
  },
  {
    name: 'Smart Home Hub',
    description: 'Central smart home controller compatible with 10,000+ devices. Supports Matter, Thread, Zigbee, and Z-Wave. Built-in AI for predictive automation routines.',
    price: 199.99,
    category: 'Electronics',
    brand: 'NexaHome',
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', alt: 'Smart home hub' }],
    stock: 8,
    featured: false,
    rating: 4.3,
    numReviews: 67,
    tags: ['smart home', 'IoT', 'automation', 'hub'],
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Full-mesh ergonomic office chair with adjustable lumbar support, 4D armrests, headrest, and seat depth adjustment. BIFMA certified for 8-hour use.',
    price: 499.99,
    originalPrice: 699.99,
    category: 'Home & Garden',
    brand: 'ErgoWorks',
    images: [{ url: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600', alt: 'Office chair' }],
    stock: 18,
    featured: true,
    rating: 4.9,
    numReviews: 334,
    tags: ['chair', 'ergonomic', 'office', 'furniture'],
  },
  {
    name: 'Cold Brew Coffee Maker',
    description: 'Large-capacity 1.5L cold brew maker with ultra-fine stainless steel filter. Makes smooth concentrate in 12-24 hours. BPA-free glass carafe with pour spout.',
    price: 59.99,
    category: 'Home & Garden',
    brand: 'BrewCraft',
    images: [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', alt: 'Cold brew maker' }],
    stock: 90,
    featured: false,
    rating: 4.5,
    numReviews: 178,
    tags: ['coffee', 'cold brew', 'kitchen', 'beverage'],
  },
  {
    name: 'Skincare Essentials Set',
    description: 'Complete 5-step skincare routine: gentle cleanser, toning essence, vitamin C serum, moisturizer, and SPF 50 sunscreen. Dermatologist tested, fragrance-free.',
    price: 129.99,
    originalPrice: 179.99,
    category: 'Beauty',
    brand: 'GlowLab',
    images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', alt: 'Skincare set' }],
    stock: 55,
    featured: false,
    rating: 4.6,
    numReviews: 445,
    tags: ['skincare', 'beauty', 'serum', 'moisturizer'],
  },
  {
    name: 'The Design of Everyday Things',
    description: 'Revised and expanded edition of Don Norman\'s classic book on human-centered design. Essential reading for designers, engineers, and anyone curious about how things work.',
    price: 24.99,
    category: 'Books',
    brand: 'Basic Books',
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', alt: 'Book cover' }],
    stock: 200,
    featured: false,
    rating: 4.8,
    numReviews: 891,
    tags: ['design', 'UX', 'book', 'nonfiction'],
  },
  {
    name: 'Wireless Charging Pad Pro',
    description: '3-in-1 MagSafe-compatible charging pad for iPhone, AirPods, and Apple Watch. 15W fast charge, LED charging indicator, anti-slip base. No cable clutter.',
    price: 49.99,
    category: 'Electronics',
    brand: 'ChargeTech',
    images: [{ url: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=600', alt: 'Wireless charger' }],
    stock: 120,
    featured: false,
    rating: 4.2,
    numReviews: 234,
    tags: ['charging', 'wireless', 'MagSafe', 'accessories'],
  },
  {
    name: 'Trail Running Shoes',
    description: 'All-terrain trail running shoes with Vibram Megagrip outsole, waterproof Gore-Tex lining, and carbon fiber plate for energy return. Drop: 8mm.',
    price: 189.99,
    category: 'Sports',
    brand: 'TrailBlazer',
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', alt: 'Trail running shoes' }],
    stock: 35,
    featured: true,
    rating: 4.7,
    numReviews: 156,
    tags: ['running', 'trail', 'shoes', 'outdoor'],
  },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Starting seed...');

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  const createdUsers = await User.create(users);
  const createdProducts = await Product.create(products);

  console.log(`✅ Created ${createdUsers.length} users`);
  console.log(`✅ Created ${createdProducts.length} products`);
  console.log('\n📋 Admin credentials:');
  console.log('   Email: admin@ecommerce.com');
  console.log('   Password: Admin1234!');
  console.log('\n📋 Customer credentials:');
  console.log('   Email: jane@example.com');
  console.log('   Password: Password123!');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
