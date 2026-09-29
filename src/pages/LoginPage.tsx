import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Radio, ShieldCheck, ArrowRight, CheckCircle2, Cpu, Activity, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const login = useAppStore(s => s.login);
  const [email, setEmail] = useState('a.sharma@metrology.gov.in');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const personas = [
    { name: 'A. Sharma', role: 'Operator', email: 'a.sharma@metrology.gov.in', pass: 'demo' },
    { name: 'P. Reddy', role: 'Reviewer', email: 'p.reddy@metrology.gov.in', pass: 'demo' },
    { name: 'K. Verma', role: 'Auditor', email: 'k.verma@metrology.gov.in', pass: 'demo' },
    { name: 'Dr. S. Nair', role: 'Lab Director', email: 's.nair@metrology.gov.in', pass: 'demo' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email identifier required.'); return; }
    if (!password.trim()) { setError('Password required.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 450));
    const ok = login(email, password);
    setLoading(false);
    if (!ok) setError('Invalid metrology terminal credentials.');
  };

  const handleSelectPersona = (p: typeof personas[0]) => {
    setEmail(p.email);
    setPassword(p.pass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      background: 'var(--bg-void)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background technical grid */}
      <div className="ambient-engineering-grid" />

      {/* LEFT: Cinematic Engineering Graphic & Product Identity */}
      <div style={{
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--slate-border)',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(13, 17, 23, 0.95) 0%, rgba(8, 10, 15, 0.98) 100%)',
      }}>
        {/* Brand Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 6,
              background: 'linear-gradient(135deg, #1f2937, #0f151e)',
              border: '1px solid var(--amber-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--amber)', boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)'
            }}>
              <Radio size={22} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.08em', color: '#fff' }}>
                METRO
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--amber)', letterSpacing: '0.12em', fontWeight: 700 }}>
                PRECISION TESTING SYSTEM
              </div>
            </div>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            maxWidth: 580,
            marginBottom: '1rem',
          }}>
            Digital Verification for Non-Automatic Weighing Instruments.
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            maxWidth: 520,
            lineHeight: 1.6,
          }}>
            Automated test sequencing, live error-curve calculations, MPE tolerance evaluation, and cryptographic audit certification strictly compliant with <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>OIML Recommendation R-76-1:2006</span>.
          </p>
        </div>

        {/* Precision Balance Schematic SVG Illustration */}
        <div style={{
          margin: '2rem 0',
          padding: '2rem',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--slate-border)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)'
          }}>
            <span>SYSTEM SCHEMATIC: LOAD CELL METROLOGY SENSOR</span>
            <span style={{ color: 'var(--pass-green-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-radar-dot" style={{ width: 6, height: 6 }} /> REAL-TIME SAMPLING
            </span>
          </div>

          <svg width="100%" height="160" viewBox="0 0 540 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Base platform */}
            <rect x="40" y="110" width="460" height="12" rx="2" fill="#16202c" stroke="#2d3b4e" strokeWidth="1.5" />
            <rect x="180" y="122" width="180" height="8" rx="2" fill="#0d1117" stroke="#1f2937" strokeWidth="1" />
            
            {/* Weighing Pan */}
            <rect x="100" y="40" width="340" height="8" rx="2" fill="#1f2937" stroke="#f59e0b" strokeWidth="1.5" />
            <path d="M 120 40 L 150 110 M 420 40 L 390 110" stroke="#374151" strokeDasharray="3 3" />
            
            {/* Center Load Cell Column */}
            <rect x="250" y="48" width="40" height="62" rx="3" fill="#121821" stroke="#3b82f6" strokeWidth="1.5" />
            <circle cx="270" cy="79" r="6" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1" />
            <line x1="240" y1="79" x2="300" y2="79" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

            {/* Dimension / Callout Ticks */}
            <line x1="50" y1="20" x2="50" y2="35" stroke="#64748b" strokeWidth="1" />
            <line x1="50" y1="25" x2="100" y2="25" stroke="#64748b" strokeWidth="1" />
            <text x="110" y="28" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="10">LEVEL PLANE = 0.00°</text>

            <line x1="490" y1="70" x2="490" y2="90" stroke="#64748b" strokeWidth="1" />
            <line x1="440" y1="80" x2="490" y2="80" stroke="#64748b" strokeWidth="1" />
            <text x="370" y="75" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize="10">STRAIN BRIDGE</text>
          </svg>

          <div style={{
            display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.75rem',
            borderTop: '1px solid var(--slate-border)', paddingTop: '0.75rem'
          }}>
            <span>MAX CAP: 10,000 g</span>
            <span>DIV: e = 0.1 g</span>
            <span>CLASS: II (HIGH)</span>
            <span>MPE: ±0.5e / ±1.0e / ±1.5e</span>
          </div>
        </div>

        {/* Regulatory Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--amber)" />
            <span>OIML R-76-1 EDITION 2006</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Cpu size={16} color="var(--pass-green)" />
            <span>ISO/IEC 17025 VERIFIED</span>
          </div>
        </div>
      </div>

      {/* RIGHT: High-End Obsidian Control Console */}
      <div style={{
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'var(--bg-void)',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          {/* Terminal Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.3rem 0.65rem', borderRadius: 4, background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid var(--amber-border)', color: 'var(--amber)',
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, marginBottom: '1rem'
            }}>
              <Lock size={12} /> SECURE LABORATORY ACCESS
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Workstation Login
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Select an authorized laboratory persona or enter your metrology ID credentials.
            </p>
          </div>

          {/* Quick Persona Selector Strip */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.65rem' }}>
              AUTHORIZED PERSONAS (1-CLICK TEST LOGIN)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              {personas.map(p => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  style={{
                    padding: '0.65rem 0.75rem',
                    textAlign: 'left',
                    background: email === p.email ? 'var(--bg-panel-hover)' : 'var(--bg-surface)',
                    border: `1px solid ${email === p.email ? 'var(--amber)' : 'var(--slate-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--amber)', textTransform: 'uppercase' }}>
                    {p.role}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Metrology ID / Email</label>
              <input
                className={`form-input ${error ? 'error' : ''}`}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@metrology.gov.in"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Terminal Passkey</label>
              <input
                className={`form-input ${error ? 'error' : ''}`}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '0.65rem 0.85rem', background: 'var(--fail-red-dim)',
                border: '1px solid var(--fail-red-border)', borderRadius: 4,
                color: 'var(--fail-red-light)', fontSize: '0.8rem', marginBottom: '1.25rem',
                fontFamily: 'var(--font-mono)'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-precision-amber"
              disabled={loading}
              style={{ width: '100%', padding: '0.85rem 1rem' }}
            >
              {loading ? 'AUTHENTICATING ENCRYPTED SESSION...' : 'AUTHORIZE & INITIALIZE WORKSTATION'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Terminal Footer Status */}
          <div style={{
            marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-radar-dot" style={{ width: 6, height: 6 }} /> SECURE GATEWAY
            </span>
            <span>NODE: IN-DEL-METRO-01</span>
          </div>
        </div>
      </div>
    </div>
  );
}
