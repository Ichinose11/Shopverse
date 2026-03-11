import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart, selectCartItems, selectCartTotal } from '../store/slices/cartSlice';
import { useToast } from '../components/Toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#f0f0f4',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#6e6e80' },
      backgroundColor: 'transparent',
    },
    invalid: { color: '#ef4444' },
  },
};

function CheckoutForm({ order, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (error) {
      setCardError(error.message);
      toast(error.message, 'error');
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      dispatch(clearCart());
      toast('Payment successful! Order confirmed.', 'success');
      navigate(`/orders/${order._id}?success=true`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {cardError && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{cardError}</p>}
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>🔒 Card data is processed directly by Stripe. We never see or store your card details.</p>
      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={!stripe || processing}>
        {processing ? 'Processing Payment...' : `Pay ₹${order?.totalPrice?.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const { user } = useSelector((s) => s.auth);
  const { loading, order, clientSecret, error } = useSelector((s) => s.orders);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const [address, setAddress] = useState({
    street: user?.shippingAddress?.street || '',
    city: user?.shippingAddress?.city || '',
    state: user?.shippingAddress?.state || '',
    zipCode: user?.shippingAddress?.zipCode || '',
    country: user?.shippingAddress?.country || 'US',
  });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    const result = await dispatch(createOrder({
      orderItems: items.map((i) => ({ product: i._id, quantity: i.quantity })),
      shippingAddress: address,
      paymentMethod: 'stripe',
    }));

    if (createOrder.rejected.match(result)) {
      toast(result.payload || 'Failed to create order', 'error');
    }
  };

  if (items.length === 0 && !order) {
    return (
      <div className="page container empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products before checking out</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: 32 }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>
          {/* Left: Address + Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Shipping Address */}
            {!clientSecret && (
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>📦 Shipping Address</h2>
                <form onSubmit={handlePlaceOrder} className="form">
                  <div className="input-group">
                    <label className="input-label">Street Address</label>
                    <input className="input" required placeholder="123 Main St" value={address.street} onChange={(e) => setAddress(p => ({ ...p, street: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">City</label>
                      <input className="input" required placeholder="New York" value={address.city} onChange={(e) => setAddress(p => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">State</label>
                      <input className="input" required placeholder="NY" value={address.state} onChange={(e) => setAddress(p => ({ ...p, state: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">ZIP Code</label>
                      <input className="input" required placeholder="10001" value={address.zipCode} onChange={(e) => setAddress(p => ({ ...p, zipCode: e.target.value }))} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Country</label>
                      <select className="input" value={address.country} onChange={(e) => setAddress(p => ({ ...p, country: e.target.value }))}>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="IN">India</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                  {error && <div style={{ padding: '12px 16px', background: 'var(--red-dim)', borderRadius: 'var(--radius)', fontSize: 14, color: 'var(--red)' }}>{error}</div>}
                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Creating Order...' : 'Continue to Payment →'}
                  </button>
                </form>
              </div>
            )}

            {/* Payment */}
            {clientSecret && order && (
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>💳 Payment</h2>
                <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 24 }}>Test card: 4242 4242 4242 4242 · Any future date · Any CVC</p>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm order={order} clientSecret={clientSecret} />
                </Elements>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 88 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={item.images?.[0]?.url} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>×{item.quantity}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            {[['Subtotal', `₹${subtotal.toFixed(2)}`], ['Shipping', subtotal > 100 ? 'Free' : '₹9.99'], ['Tax (10%)', `₹${tax.toFixed(2)}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: 'var(--text-2)' }}>
                <span>{l}</span><span style={{ color: v === 'Free' ? 'var(--green)' : 'var(--text-1)' }}>{v}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--accent-light)' }}>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
