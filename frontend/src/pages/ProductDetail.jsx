import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, clearProduct } from '../store/slices/productSlice';
import { addToCart, openCart } from '../store/slices/cartSlice';
import { productAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Stars = ({ rating, interactive, onChange }) => (
  <div className="stars" style={{ fontSize: interactive ? 24 : 14, cursor: interactive ? 'pointer' : 'default' }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.round(rating) ? '' : 'star-empty'} onClick={() => interactive && onChange(s)}>★</span>
    ))}
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { product, detailLoading, error } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(id));
    return () => dispatch(clearProduct());
  }, [id, dispatch]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) dispatch(addToCart(product));
    dispatch(openCart());
    toast(`${product.name} (×${qty}) added to cart`, 'success');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await productAPI.createReview(id, review);
      toast('Review submitted!', 'success');
      setReview({ rating: 5, comment: '' });
      dispatch(fetchProduct(id));
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally { setSubmitting(false); }
  };

  if (detailLoading) return (
    <div className="page container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[200, 100, 300, 150, 60].map((w, i) => <div key={i} className="skeleton" style={{ height: i === 0 ? 40 : 20, width: `${w}px`, maxWidth: '100%' }} />)}
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="page container empty-state">
      <div className="empty-state-icon">😕</div>
      <h3>Product not found</h3>
      <button className="btn btn-primary" onClick={() => navigate('/products')}>Back to Products</button>
    </div>
  );

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, fontSize: 13, color: 'var(--text-3)' }}>
          <span style={{ cursor: 'pointer', color: 'var(--accent-light)' }} onClick={() => navigate('/')}>Home</span> /
          <span style={{ cursor: 'pointer', color: 'var(--accent-light)' }} onClick={() => navigate('/products')}>Products</span> /
          <span>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div className="card" style={{ aspectRatio: '1', overflow: 'hidden', background: 'var(--bg-2)', marginBottom: 12 }}>
              <img src={product.images?.[activeImg]?.url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{
                    width: 64, height: 64, borderRadius: 'var(--radius)',
                    overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${activeImg === i ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span className="badge badge-gray">{product.category}</span>
                {product.brand && <span className="badge badge-gray">{product.brand}</span>}
                {discount && <span className="badge badge-green">-{discount}% OFF</span>}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Stars rating={product.rating} />
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="price" style={{ fontSize: 36 }}>₹{product.price.toFixed(2)}</span>
              {product.originalPrice && <span className="price-original" style={{ fontSize: 18 }}>₹{product.originalPrice.toFixed(2)}</span>}
            </div>

            <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>{product.description}</p>

            <div style={{ display: 'flex', align: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: product.stock > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 44, background: 'none', color: 'var(--text-1)', cursor: 'pointer', fontSize: 20 }}>−</button>
                  <span style={{ width: 44, textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: 44, height: 44, background: 'none', color: 'var(--text-1)', cursor: 'pointer', fontSize: 20 }}>+</button>
                </div>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToCart}>Add to Cart — ₹{(product.price * qty).toFixed(2)}</button>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.tags.map((tag) => <span key={tag} style={{ padding: '3px 10px', background: 'var(--bg-3)', borderRadius: 100, fontSize: 11, color: 'var(--text-3)' }}>#{tag}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div style={{ marginTop: 64 }}>
          <div className="divider" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Customer Reviews</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {/* Review list */}
            <div>
              {product.reviews?.length === 0 ? (
                <p style={{ color: 'var(--text-3)' }}>No reviews yet. Be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {product.reviews.map((r) => (
                    <div key={r._id} style={{ padding: 20, background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <Stars rating={r.rating} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review form */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Write a Review</h3>
              {user ? (
                <form onSubmit={handleReview} className="form">
                  <div className="input-group">
                    <label className="input-label">Your Rating</label>
                    <Stars rating={review.rating} interactive onChange={(r) => setReview((p) => ({ ...p, rating: r }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Comment</label>
                    <textarea className="input" rows={4} required value={review.comment}
                      onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))}
                      placeholder="Share your experience with this product..." style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                </form>
              ) : (
                <div style={{ padding: 24, background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>Sign in to leave a review</p>
                  <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign In</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
