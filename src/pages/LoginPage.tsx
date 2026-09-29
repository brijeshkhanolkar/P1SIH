import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Scale } from 'lucide-react';

export default function LoginPage() {
  const login = useAppStore(s => s.login);
  const [email, setEmail] = useState('a.sharma@metrology.gov.in');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    setLoading(false);
    if (!ok) setError('Invalid credentials.');
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card animate-in">
        <div className="login-brand">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: 'var(--amber-dim)', border: '1px solid rgba(232,133,12,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Scale size={24} color="var(--amber)" />
            </div>
          </div>
          <h1>METROLOGY</h1>
          <div className="subtitle">NAWI Testing Platform</div>
          <p className="tagline">
            Digital testing, compliance and reporting for non-automatic weighing instruments.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={`form-input ${error ? 'error' : ''}`}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@metrology.gov.in"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className={`form-input ${error ? 'error' : ''}`}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="form-hint" style={{ marginBottom: 16, textAlign: 'center' }}>
            Demo: Use any of the pre-filled accounts or enter any email.
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-status">System Operational</div>
      </div>
    </div>
  );
}
