import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/orders', label: 'Orders', icon: '🛒' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--bg-1)',
        borderRight: '1px solid var(--border)',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        zIndex: 100,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>
            Shop<span style={{ color: 'var(--accent)' }}>Forge</span>
          </Link>
          <div style={{ marginTop: 8 }}>
            <span className="badge badge-purple" style={{ fontSize: 10 }}>Admin Panel</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ path, label, icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius)',
                marginBottom: 4, fontSize: 14, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent-light)' : 'var(--text-2)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <Link to="/" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: 10, marginBottom: 6 }}>
            🏠 Back to Store
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', gap: 10, color: 'var(--red)' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, padding: 32, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
