import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

const CATEGORY_ICONS = {
  Electronics: '⚡', Clothing: '👗', Books: '📚',
  'Home & Garden': '🏡', Sports: '🏃', Beauty: '✨', Toys: '🎮', Other: '📦',
};

export default function Home() {
  const dispatch = useDispatch();
  const { list: products, categories, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, limit: 6 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-0) 0%, var(--bg-1) 40%, #0f0a1f 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '60%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(124, 92, 252, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 640 }}>
            <span className="badge badge-purple" style={{ marginBottom: 20 }}>✦ Premium E-Commerce</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(44px, 6vw, 80px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 24,
            }}>
              Discover<br />
              <span style={{ color: 'var(--accent-light)' }}>Exceptional</span><br />
              Products
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-2)', marginBottom: 36, lineHeight: 1.7, maxWidth: 480 }}>
              Premium goods curated for those who value quality. From cutting-edge electronics to everyday essentials.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/products" className="btn btn-primary btn-lg">Shop Now →</Link>
              <Link to="/products?featured=true" className="btn btn-secondary btn-lg">Featured Items</Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 56, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
              {[['500+', 'Products'], ['100+', 'Happy Customers'], ['24h', 'Fast Support']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--accent-light)' }}>{val}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
            Browse by Category
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Link key={cat} to={`/products?category=${cat}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px',
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', fontSize: 14, fontWeight: 500,
                color: 'var(--text-2)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
              >
                <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat] || '📦'}</span>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '64px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Featured Products</h2>
            <Link to="/products" style={{ color: 'var(--accent-light)', fontSize: 14, fontWeight: 600 }}>View all →</Link>
          </div>

          {loading ? (
            <div className="grid-products">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ aspectRatio: '1' }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 32 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-products">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Trust Signals */}
      <section style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', padding: '56px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              ['🔒', 'Secure Payments', 'JWT-authenticated checkout with Stripe'],
              ['⚡', 'Fast Delivery', 'Express shipping on orders over ₹100'],
              ['↩️', 'Easy Returns', '30-day hassle-free return policy'],
              ['💬', '24/7 Support', 'Real humans ready to help anytime'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
