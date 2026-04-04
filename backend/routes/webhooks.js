const express = require('express');
const router = express.Router();
const { stripeWebhook } = require('../controllers/webhookController');

// CRITICAL: Raw body required for Stripe signature verification
// This route must be registered BEFORE express.json() middleware
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
