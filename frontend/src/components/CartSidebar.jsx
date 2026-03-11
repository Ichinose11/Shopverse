import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectCartItems, selectCartTotal, selectCartIsOpen,
  removeFromCart, updateQuantity, closeCart,
} from '../store/slices/cartSlice';

export default function CartSidebar() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isOpen = useSelector(selectCartIsOpen);

  const shipping = total > 100 ? 0 : 9.99;
  const tax = total * 0.1;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => dispatch(closeCart())}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 1100,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--bg-1)', borderLeft: '1px solid var(--border)',
        zIndex: 1200, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.3s var(--ease)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
            Cart <span style={{ color: 'var(--accent)', fontSize: 14 }}>({items.length})</span>
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch(closeCart())} style={{ padding: '6px 10px' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 0' }}>
              <div className="empty-state-icon">🛍️</div>
              <h3>Cart is empty</h3>
              <p>Add some products to get started</p>
              <button className="btn btn-primary btn-sm" onClick={() => dispatch(closeCart())} style={{ marginTop: 8 }}>
                Browse Products
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item) => (
                <div key={item._id} style={{
                  display: 'flex', gap: 14,
                  padding: 14, background: 'var(--bg-2)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                }}>
                  <img
                    src={item.images?.[0]?.url || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>₹{item.price.toFixed(2)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-3)', borderRadius: 8, overflow: 'hidden' }}>
                        <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                          style={{ width: 28, height: 28, background: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 16 }}>−</button>
                        <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                          style={{ width: 28, height: 28, background: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 16 }}>+</button>
                      </div>
                      <button onClick={() => dispatch(removeFromCart(item._id))}
                        style={{ background: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 6, transition: 'color 0.15s' }}
                        onMouseOver={e => e.target.style.color = 'var(--red)'}
                        onMouseOut={e => e.target.style.color = 'var(--text-3)'}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Subtotal', `₹${total.toFixed(2)}`],
              ['Shipping', total > 100 ? 'Free' : '₹9.99'],
              ['Tax (10%)', `₹${tax.toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-2)' }}>
                <span>{label}</span>
                <span style={{ color: value === 'Free' ? 'var(--green)' : 'var(--text-1)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent-light)' }}>
                ₹{(total + shipping + tax).toFixed(2)}
              </span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full" onClick={() => dispatch(closeCart())}>
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
