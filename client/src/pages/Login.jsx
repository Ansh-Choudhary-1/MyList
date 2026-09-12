import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            className="input"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            className="input"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <button className="btn btn-primary" type="submit" disabled={loading} style={styles.submit}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 60px)',
    padding: '24px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  },
  title: { fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' },
  sub: { color: 'var(--text-muted)', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '-4px' },
  submit: { marginTop: '8px', width: '100%', padding: '12px' },
  error: {
    background: '#3b1a1a',
    border: '1px solid var(--danger)',
    color: '#f08080',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  footer: { textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' },
};
