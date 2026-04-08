import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your ExamPortal account</p>
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email" className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password" className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button id="login-submit" type="submit" className="auth-form-btn" disabled={loading}>
            {loading ? '🔄 Signing in...' : '🚀 Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div style={{ marginTop: 20, padding: '14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Demo Accounts</strong><br />
          admin@exam.com / admin123 (Admin)<br />
          teacher@exam.com / teacher123 (Teacher)<br />
          student@exam.com / student123 (Student)
        </div>
      </div>
    </div>
  );
};

export default Login;
