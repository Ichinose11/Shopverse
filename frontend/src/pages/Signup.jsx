import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, clearError } from '../store/slices/authSlice';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (user) navigate('/');
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setValidationError('Passwords do not match'); return; }
    if (form.password.length < 6) { setValidationError('Password must be at least 6 characters'); return; }
    setValidationError('');
    dispatch(signup({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 40% 80%, rgba(124,92,252,0.08) 0%, transparent 60%), var(--bg-0)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text-1)' }}>
            Shop<span style={{ color: 'var(--accent)' }}>Forge</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: 'var(--text-3)' }}>Join thousands of happy customers</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {(error || validationError) && (
            <div style={{ padding: '12px 16px', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 14, color: 'var(--red)' }}>
              {error || validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" required placeholder="Jane Doe" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" required placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input className="input" type="password" required placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
