import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';

function StatCard({ icon, label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 8 }}>{label}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 32, opacity: 0.6 }}>{icon}</span>
      </div>
    </div>
  );
}

const STATUS_COLOR = { Pending: 'yellow', Processing: 'purple', Shipped: 'green', Delivered: 'green', Cancelled: 'red' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then((r) => { setStats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton card" style={{ height: 110 }} />)}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Overview of your store performance</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard icon="💰" label="Total Revenue" value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`} sub="From paid orders" color="var(--green)" />
        <StatCard icon="🛒" label="Total Orders" value={stats?.totalOrders || 0} sub="All time" />
        <StatCard icon="📦" label="Products" value={stats?.totalProducts || 0} sub="Active listings" color="var(--yellow)" />
        <StatCard icon="👥" label="Customers" value={stats?.totalUsers || 0} sub="Registered accounts" color="var(--accent-light)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Order Status Breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Order Status</h2>
          {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span className={`badge badge-${STATUS_COLOR[status] || 'gray'}`} style={{ minWidth: 90, justifyContent: 'center' }}>{status}</span>
              <div style={{ flex: 1, height: 6, background: 'var(--bg-3)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ width: `${(count / stats.totalOrders) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 100 }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
          {!stats?.statusBreakdown || Object.keys(stats.statusBreakdown).length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No orders yet</p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>⚡ Low Stock Alert</h2>
          {stats?.lowStock?.length === 0 ? (
            <div style={{ display: 'flex', gap: 12, padding: '16px', background: 'var(--green-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span style={{ fontSize: 20 }}>✓</span>
              <p style={{ fontSize: 14, color: 'var(--green)' }}>All products have adequate stock levels.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats?.lowStock?.map((p) => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--yellow-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--yellow)' }}>{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 24, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ color: 'var(--accent-light)', fontSize: 13, fontWeight: 600 }}>View all →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id}>
                    <td><Link to={`/admin/orders`} style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>#{order._id?.slice(-8).toUpperCase()}</Link></td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td style={{ color: 'var(--text-1)', fontWeight: 700 }}>${order.totalPrice?.toFixed(2)}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[order.status] || 'gray'}`}>{order.status}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats?.recentOrders?.length && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-3)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
