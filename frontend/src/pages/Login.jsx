import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [user, navigate, from, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 20%, rgba(124,92,252,0.08) 0%, transparent 60%), var(--bg-0)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text-1)' }}>
            Shop<span style={{ color: 'var(--accent)' }}>Forge</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-3)' }}>Sign in to your account to continue</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 14, color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" required placeholder="••••••••" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-3)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign up free</Link>
          </p>

          {/* Demo credentials */}
          <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-2)' }}>Demo Credentials:</strong><br />
            Customer: jane@example.com / Password123!<br />
            Admin: admin@ecommerce.com / Admin1234!
          </div>
        </div>
      </div>
    </div>
  );
}
