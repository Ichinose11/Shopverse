import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { toggleCart, selectCartCount } from '../store/slices/cartSlice';
import { useState } from 'react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'rgba(10, 10, 11, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
        {/* Logo */}
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--text-1)', flexShrink: 0 }}>
          Shop<span style={{ color: 'var(--accent)' }}>Forge</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[['/', 'Home'], ['/products', 'Products']].map(([path, label]) => (
            <Link key={path} to={path} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: isActive(path) ? 'var(--text-1)' : 'var(--text-3)',
              background: isActive(path) ? 'var(--bg-3)' : 'transparent',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { if (!isActive(path)) e.target.style.color = 'var(--text-2)'; }}
            onMouseOut={e => { if (!isActive(path)) e.target.style.color = 'var(--text-3)'; }}
            >{label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Cart */}
          <button
            onClick={() => dispatch(toggleCart())}
            style={{
              position: 'relative',
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-2)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--text-1)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--accent)', color: '#fff',
                width: 18, height: 18, borderRadius: '50%',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
              }}>{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '7px 14px',
                  color: 'var(--text-1)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14,
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'var(--accent-light)',
                }}>{user.name?.charAt(0).toUpperCase()}</span>
                {user.name?.split(' ')[0]}
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {menuOpen && (
                <div onClick={() => setMenuOpen(false)} style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: 8,
                  minWidth: 180,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  zIndex: 100,
                }}>
                  {[
                    ['/orders', 'My Orders', '📦'],
                    ['/profile', 'Profile', '👤'],
                    ...(user.role === 'admin' ? [['/admin', 'Admin Panel', '⚡']] : []),
                  ].map(([path, label, icon]) => (
                    <Link key={path} to={path} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 8,
                      fontSize: 14, color: 'var(--text-2)',
                      transition: 'all 0.1s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
                    >{icon} {label}</Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    fontSize: 14, color: 'var(--red)', background: 'transparent',
                    transition: 'all 0.1s', cursor: 'pointer',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--red-dim)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
