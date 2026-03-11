import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart, openCart } from '../store/slices/cartSlice';
import { useToast } from './Toast';

const Stars = ({ rating }) => (
  <div className="stars" style={{ fontSize: 12 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.round(rating) ? '' : 'star-empty'}>★</span>
    ))}
  </div>
);

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const toast = useToast();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    dispatch(addToCart(product));
    dispatch(openCart());
    toast(`${product.name} added to cart`, 'success');
  };

  return (
    <Link to={`/products/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card" style={{
        transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease), border-color 0.2s',
        cursor: 'pointer',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.4)';
        e.currentTarget.style.borderColor = 'var(--border-light)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'var(--bg-2)' }}>
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s var(--ease)' }}
            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
          />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            {discount && <span className="badge badge-green" style={{ fontSize: 10 }}>-{discount}%</span>}
            {product.featured && <span className="badge badge-purple" style={{ fontSize: 10 }}>Featured</span>}
            {product.stock === 0 && <span className="badge badge-gray" style={{ fontSize: 10 }}>Out of Stock</span>}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '16px 16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Stars rating={product.rating || 0} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>({product.numReviews || 0})</span>
          </div>

          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </p>

          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{product.category}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="price" style={{ fontSize: 18 }}>₹{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="price-original">₹{product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius)',
                background: product.stock === 0 ? 'var(--bg-3)' : 'var(--accent-dim)',
                border: `1px solid ${product.stock === 0 ? 'var(--border)' : 'var(--accent-border)'}`,
                color: product.stock === 0 ? 'var(--text-3)' : 'var(--accent-light)',
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
              onMouseOver={e => { if (product.stock > 0) { e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'var(--accent)'; }}}
              onMouseOut={e => { if (product.stock > 0) { e.target.style.background = 'var(--accent-dim)'; e.target.style.color = 'var(--accent-light)'; e.target.style.borderColor = 'var(--accent-border)'; }}}
            >
              {product.stock === 0 ? 'Out of Stock' : '+ Add'}
            </button>
          </div>

          {product.stock > 0 && product.stock < 10 && (
            <p style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 8 }}>⚡ Only {product.stock} left</p>
          )}
        </div>
      </div>
    </Link>
  );
}
