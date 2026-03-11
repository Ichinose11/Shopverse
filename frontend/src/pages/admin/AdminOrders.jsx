import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import { useToast } from '../../components/Toast';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const STATUS_COLOR = { Pending: 'yellow', Processing: 'purple', Shipped: 'green', Delivered: 'green', Cancelled: 'red', Refunded: 'gray' };

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    adminAPI.getOrders(params).then((r) => {
      setOrders(r.data.data);
      setPagination(r.data.pagination);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filter]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await adminAPI.updateOrder(orderId, { status });
      toast(`Order status updated to ${status}`, 'success');
      load();
    } catch { toast('Failed to update order', 'error'); }
    setUpdating(null);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Orders</h1>
          {pagination && <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{pagination.total} total orders</p>}
        </div>
        <select className="input" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} style={{ width: 180 }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : orders.map((order) => (
                <>
                  <tr key={order._id} style={{ cursor: 'pointer' }}>
                    <td>
                      <button onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                        style={{ background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-light)', fontSize: 14 }}>
                        #{order._id?.slice(-8).toUpperCase()}
                        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-3)' }}>{expanded === order._id ? '▲' : '▼'}</span>
                      </button>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{order.user?.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{order.user?.email}</p>
                      </div>
                    </td>
                    <td>{order.orderItems?.length} items</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-1)' }}>${order.totalPrice?.toFixed(2)}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[order.status] || 'gray'}`}>{order.status}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.status}
                        disabled={updating === order._id}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        style={{
                          background: 'var(--bg-3)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', color: 'var(--text-1)',
                          fontSize: 12, padding: '5px 10px', cursor: 'pointer',
                        }}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {expanded === order._id && (
                    <tr key={`${order._id}-detail`}>
                      <td colSpan="7" style={{ background: 'var(--bg-2)', padding: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Order Items</p>
                            {order.orderItems?.map((item) => (
                              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                <span>{item.name} ×{item.quantity}</span>
                                <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Shipping Address</p>
                            {order.shippingAddress && Object.values(order.shippingAddress).map((v, i) => (
                              <p key={i} style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{v}</p>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!loading && orders.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>No orders found</td></tr>
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
