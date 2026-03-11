import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import { useToast } from '../../components/Toast';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Other'];

const DEFAULTS = {
  name: '', description: '', price: '', originalPrice: '', category: 'Electronics',
  brand: '', stock: '', featured: false, isActive: true,
  images: [{ url: '', alt: '' }], tags: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id) && id !== 'new';

  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    adminAPI.getProducts({ limit: 1 }) // fallback: load from product list
      .then(() => {
        // In real usage, add a getOne endpoint; for now use general fetch
        import('../../services/api').then(({ productAPI }) => {
          productAPI.getOne(id).then((r) => {
            const p = r.data.data;
            setForm({
              ...p,
              tags: p.tags?.join(', ') || '',
              price: p.price?.toString() || '',
              originalPrice: p.originalPrice?.toString() || '',
              stock: p.stock?.toString() || '',
            });
            setFetching(false);
          });
        });
      }).catch(() => setFetching(false));
  }, [id, isEdit]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: parseInt(form.stock),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      images: form.images.filter((img) => img.url),
    };

    try {
      if (isEdit) {
        await adminAPI.updateProduct(id, payload);
        toast('Product updated successfully', 'success');
      } else {
        await adminAPI.createProduct(payload);
        toast('Product created successfully', 'success');
      }
      navigate('/admin/products');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save product', 'error');
    }
    setLoading(false);
  };

  if (fetching) return (
    <AdminLayout>
      <div className="skeleton" style={{ height: 600, borderRadius: 'var(--radius-lg)' }} />
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button onClick={() => navigate('/admin/products')} style={{ background: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '8px', fontSize: 20 }}>←</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>{isEdit ? 'Edit Product' : 'New Product'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, color: 'var(--text-3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Basic Info</h3>
            <div className="form" style={{ gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Product Name *</label>
                <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Wireless Headphones Pro" />
              </div>
              <div className="input-group">
                <label className="input-label">Description *</label>
                <textarea className="input" required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Detailed product description..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select className="input" required value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Brand</label>
                  <input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Sony" />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Price (USD) *</label>
                  <input className="input" type="number" required min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0.00" />
                </div>
                <div className="input-group">
                  <label className="input-label">Original Price (for discount)</label>
                  <input className="input" type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Stock Count *</label>
                <input className="input" type="number" required min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="0" style={{ maxWidth: 200 }} />
              </div>
              <div className="input-group">
                <label className="input-label">Tags (comma separated)</label>
                <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="e.g. wireless, audio, premium" />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, color: 'var(--text-3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Images</h3>
            {form.images.map((img, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input className="input" value={img.url} onChange={(e) => {
                    const imgs = [...form.images];
                    imgs[i] = { ...imgs[i], url: e.target.value };
                    set('images', imgs);
                  }} placeholder="https://... (image URL)" />
                </div>
                {img.url && <img src={img.url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display='none'} />}
                {form.images.length > 1 && (
                  <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))} style={{ background: 'none', color: 'var(--red)', cursor: 'pointer', padding: '10px 8px', fontSize: 18 }}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => set('images', [...form.images, { url: '', alt: '' }])}>+ Add Image URL</button>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, color: 'var(--text-3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settings</h3>
            <div style={{ display: 'flex', gap: 24 }}>
              {[['featured', 'Featured Product', 'Show in featured section'], ['isActive', 'Active Listing', 'Visible to customers']].map(([key, label, desc]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div onClick={() => set(key, !form[key])} style={{
                    width: 44, height: 24, borderRadius: 100,
                    background: form[key] ? 'var(--accent)' : 'var(--bg-3)',
                    border: `1px solid ${form[key] ? 'var(--accent)' : 'var(--border)'}`,
                    position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: form[key] ? 'calc(100% - 22px)' : 2,
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
