const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Handle Stripe webhooks
// @route   POST /api/webhooks/stripe
// @access  Public (Stripe only — validated by signature)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Validate the webhook signature to prevent spoofed events
    event = stripe.webhooks.constructEvent(
      req.body, // raw buffer — must NOT be parsed as JSON before this
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: skip already-processed events
  const eventId = event.id;

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const order = await Order.findOne({
          stripePaymentIntentId: paymentIntent.id,
        });

        if (order && !order.processedWebhookEvents.includes(eventId)) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'Processing';
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            updateTime: new Date().toISOString(),
            emailAddress: paymentIntent.receipt_email || '',
          };
          order.processedWebhookEvents.push(eventId);

          // Decrement stock
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity },
            });
          }

          await order.save();
          console.log(`✅ Order ${order._id} marked as paid`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await Order.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: 'Cancelled' }
        );
        console.log(`❌ Payment failed for intent: ${paymentIntent.id}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        await Order.findOneAndUpdate(
          { stripePaymentIntentId: charge.payment_intent },
          { status: 'Refunded' }
        );
        console.log(`↩️ Refund processed for charge: ${charge.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    // Acknowledge to Stripe even on processing errors — prevents infinite retries
    // Log to alerting system in production
  }

  // Always acknowledge within 5 seconds to prevent Stripe retry storms
  res.json({ received: true });
};

module.exports = { stripeWebhook };
