import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import { useToast } from '../../components/Toast';

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getProducts({ page, limit: 15 }).then((r) => {
      setProducts(r.data.data);
      setPagination(r.data.pagination);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"? It will be hidden from the store.`)) return;
    setDeleting(id);
    try {
      await adminAPI.deleteProduct(id);
      toast(`${name} deactivated`, 'success');
      load();
    } catch { toast('Failed to deactivate product', 'error'); }
    setDeleting(null);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Products</h1>
          {pagination && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{pagination.total} total products</p>}
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">+ New Product</Link>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={p.images?.[0]?.url} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 2 }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{p.category}</span></td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-1)' }}>₹{p.price?.toFixed(2)}</span>
                    {p.originalPrice && <span className="price-original" style={{ marginLeft: 6 }}>₹{p.originalPrice?.toFixed(2)}</span>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--red)' : p.stock < 10 ? 'var(--yellow)' : 'var(--green)' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${p.isActive ? 'green' : 'red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/admin/products/${p._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" disabled={deleting === p._id} onClick={() => handleDelete(p._id, p.name)}>
                        {deleting === p._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="pagination" style={{ padding: '20px 0' }}>
            <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}>›</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
