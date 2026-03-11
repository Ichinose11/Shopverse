import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchMyOrders, fetchOrder } from '../store/slices/orderSlice';

const STATUS_COLORS = {
  Pending: 'yellow', Processing: 'purple', Shipped: 'green',
  Delivered: 'green', Cancelled: 'red', Refunded: 'gray',
};

export function Orders() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return (
    <div className="page container">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 'var(--radius)' }} />)}
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">{list.length} order{list.length !== 1 ? 's' : ''} total</p>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Once you place an order it will appear here</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} style={{ display: 'block' }}>
                <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20, transition: 'border-color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`badge badge-${STATUS_COLORS[order.status] || 'gray'}`}>{order.status}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--accent-light)' }}>₹{order.totalPrice?.toFixed(2)}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="var(--text-3)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);
  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  if (loading || !order) return (
    <div className="page container">
      <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        {isSuccess && (
          <div style={{ padding: '20px 24px', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-lg)', marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>Payment Successful!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Your order has been confirmed and is being processed.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 26 }}>Order #{order._id?.slice(-8).toUpperCase()}</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className={`badge badge-${STATUS_COLORS[order.status] || 'gray'}`} style={{ fontSize: 13, padding: '6px 16px' }}>{order.status}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Items */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Order Items</h2>
            {order.orderItems?.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}
                className="last:border-0">
                <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, marginBottom: 2 }}>{item.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Shipping Address */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📦 Shipping To</h2>
              {order.shippingAddress && Object.values(order.shippingAddress).map((v, i) => (
                <p key={i} style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>{v}</p>
              ))}
            </div>

            {/* Price Summary */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>💰 Summary</h2>
              {[['Subtotal', `₹${order.itemsPrice?.toFixed(2)}`], ['Shipping', order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice?.toFixed(2)}`], ['Tax', `₹${order.taxPrice?.toFixed(2)}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: 'var(--text-2)' }}>
                  <span>{l}</span><span style={{ color: v === 'Free' ? 'var(--green)' : 'var(--text-1)' }}>{v}</span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent-light)' }}>₹{order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <Link to="/orders" className="btn btn-secondary">← All Orders</Link>
          <Link to="/products" className="btn btn-primary">Continue Shopping →</Link>
        </div>
      </div>
    </div>
  );
}
