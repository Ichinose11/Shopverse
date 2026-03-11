import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list, categories, loading, pagination } = useSelector((s) => s.products);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    page: 1,
  });

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.sort) params.sort = filters.sort;
    if (filters.search) params.search = filters.search;
    params.page = filters.page;
    params.limit = 12;
    dispatch(fetchProducts(params));
  }, [dispatch, filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    setSearchParams((prev) => { if (value) prev.set(key, value); else prev.delete(key); return prev; });
  };

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">All Products</h1>
            {pagination && <p className="page-subtitle">{pagination.total} items found</p>}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="input" placeholder="🔍 Search products..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              style={{ width: 220 }}
            />
            <select className="input" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} style={{ width: 160 }}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
          {/* Sidebar filters */}
          <aside style={{ position: 'sticky', top: 88 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categories</h3>

              <button onClick={() => updateFilter('category', '')}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)', marginBottom: 4,
                  background: !filters.category ? 'var(--accent-dim)' : 'transparent',
                  border: !filters.category ? '1px solid var(--accent-border)' : '1px solid transparent',
                  color: !filters.category ? 'var(--accent-light)' : 'var(--text-2)',
                  fontSize: 14, cursor: 'pointer', fontWeight: !filters.category ? 600 : 400,
                }}>
                All Categories
              </button>

              {categories.map((cat) => (
                <button key={cat} onClick={() => updateFilter('category', cat)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)', marginBottom: 4,
                    background: filters.category === cat ? 'var(--accent-dim)' : 'transparent',
                    border: filters.category === cat ? '1px solid var(--accent-border)' : '1px solid transparent',
                    color: filters.category === cat ? 'var(--accent-light)' : 'var(--text-2)',
                    fontSize: 14, cursor: 'pointer', fontWeight: filters.category === cat ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { if (filters.category !== cat) e.currentTarget.style.background = 'var(--bg-3)'; }}
                  onMouseOut={e => { if (filters.category !== cat) e.currentTarget.style.background = 'transparent'; }}>
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Products grid */}
          <div>
            {loading ? (
              <div className="grid-products">
                {[...Array(9)].map((_, i) => (
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
            ) : list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-secondary" onClick={() => setFilters({ category: '', sort: 'newest', search: '', page: 1 })}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid-products">
                  {list.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn" onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} disabled={filters.page === 1}>‹</button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button key={i} className={`pagination-btn ${filters.page === i + 1 ? 'active' : ''}`} onClick={() => setFilters(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
                    ))}
                    <button className="pagination-btn" onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} disabled={filters.page === pagination.pages}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
