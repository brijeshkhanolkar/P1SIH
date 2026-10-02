import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Scale, ShieldCheck, ArrowRight, CheckCircle2, Cpu, Lock, Check } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
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
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/');
    } else {
      setError('Invalid metrology terminal credentials.');
    }
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
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* LEFT: Clean White & Royal Purple Metrology Hero */}
      <div style={{
        padding: '3.5rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #e2e8f0',
        position: 'relative',
        background: 'linear-gradient(145deg, #faf5ff 0%, #f5f3ff 50%, #ffffff 100%)',
      }}>
        {/* Brand Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
            }}>
              <Scale size={24} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                METRO
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--purple)', letterSpacing: '0.1em', fontWeight: 700 }}>
                OIML R-76 PRECISION TESTING PLATFORM
              </div>
            </div>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
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
            Automated test sequencing, live error-curve calculations, MPE tolerance evaluation, and cryptographic audit certification strictly compliant with <span style={{ color: 'var(--purple)', fontWeight: 700 }}>OIML Recommendation R-76-1:2006</span>.
          </p>
        </div>

        {/* Precision Balance Schematic SVG Illustration (Clean Light Edition) */}
        <div style={{
          margin: '2rem 0',
          padding: '1.75rem',
          background: '#ffffff',
          border: '1px solid #ddd6fe',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.08), 0 0 0 1px #e2e8f0',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>SYSTEM SCHEMATIC: LOAD CELL METROLOGY SENSOR</span>
            <span style={{
              color: 'var(--pass-green-light)', background: 'var(--pass-green-dim)',
              padding: '2px 8px', borderRadius: 4, border: '1px solid var(--pass-green-border)',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700
            }}>
              <span className="pulse-radar-dot" style={{ width: 6, height: 6, background: 'var(--pass-green)' }} /> REAL-TIME SAMPLING
            </span>
          </div>

          <svg width="100%" height="150" viewBox="0 0 540 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Level Datum Line */}
            <line x1="20" y1="135" x2="520" y2="135" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="25" y="146" fill="#94a3b8" fontFamily="var(--font-mono)" fontSize="9">GROUND DATUM PLANE (g=9.792 m/s²)</text>

            {/* Base platform */}
            <rect x="40" y="105" width="460" height="14" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="180" y="119" width="180" height="8" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
            
            {/* Weighing Pan / Load Receptor */}
            <rect x="100" y="38" width="340" height="10" rx="3" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
            <path d="M 120 48 L 150 105 M 420 48 L 390 105" stroke="#cbd5e1" strokeDasharray="3 3" />
            
            {/* Center Load Cell Column */}
            <rect x="250" y="48" width="40" height="57" rx="3" fill="#faf5ff" stroke="#8b5cf6" strokeWidth="1.5" />
            <circle cx="270" cy="76" r="7" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
            <line x1="240" y1="76" x2="300" y2="76" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2 2" />

            {/* Callouts */}
            <line x1="50" y1="18" x2="50" y2="35" stroke="#7c3aed" strokeWidth="1" />
            <line x1="50" y1="22" x2="100" y2="22" stroke="#7c3aed" strokeWidth="1" />
            <text x="110" y="26" fill="#7c3aed" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700">LEVEL PLANE = 0.00°</text>

            <line x1="490" y1="65" x2="490" y2="85" stroke="#7c3aed" strokeWidth="1" />
            <line x1="440" y1="75" x2="490" y2="75" stroke="#7c3aed" strokeWidth="1" />
            <text x="360" y="70" fill="#7c3aed" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700">STRAIN BRIDGE</text>
          </svg>

          <div style={{
            display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.75rem',
            borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontWeight: 600
          }}>
            <span>MAX CAP: <strong style={{ color: 'var(--text-primary)' }}>10,000 g</strong></span>
            <span>DIV: <strong style={{ color: 'var(--purple)' }}>e = 0.1 g</strong></span>
            <span>CLASS: <strong style={{ color: 'var(--purple)' }}>CLASS II</strong></span>
            <span>MPE: <strong style={{ color: 'var(--pass-green-light)' }}>±0.5e / ±1.0e / ±1.5e</strong></span>
          </div>
        </div>

        {/* Regulatory Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <ShieldCheck size={18} color="var(--purple)" />
            <span>OIML R-76-1 EDITION 2006</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <Cpu size={18} color="var(--pass-green)" />
            <span>ISO/IEC 17025 VERIFIED</span>
          </div>
        </div>
      </div>

      {/* RIGHT: High-End White & Royal Purple Control Console */}
      <div style={{
        padding: '3.5rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#ffffff',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.75rem', borderRadius: 6, background: 'var(--purple-dim)',
              border: '1px solid var(--purple-border)', color: 'var(--purple)',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '1rem'
            }}>
              <Lock size={13} /> SECURE LABORATORY ACCESS
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Workstation Login
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Select an authorized laboratory persona or enter your metrology ID credentials.
            </p>
          </div>

          {/* Quick Persona Selector Strip */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              AUTHORIZED PERSONAS (1-CLICK TEST LOGIN)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {personas.map(p => {
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    style={{
                      padding: '0.75rem 0.85rem',
                      textAlign: 'left',
                      background: isSelected ? 'var(--purple-dim)' : '#ffffff',
                      border: `1.5px solid ${isSelected ? 'var(--purple)' : 'var(--slate-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(124, 58, 237, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                      {isSelected && <Check size={14} color="var(--purple)" />}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                      color: isSelected ? 'var(--purple)' : 'var(--text-muted)',
                      textTransform: 'uppercase', fontWeight: 700, marginTop: 2
                    }}>
                      {p.role}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Metrology ID / Email
              </label>
              <input
                className={`form-input ${error ? 'error' : ''}`}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@metrology.gov.in"
                required
                style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Terminal Passkey
              </label>
              <input
                className={`form-input ${error ? 'error' : ''}`}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.65rem 0.85rem', background: 'var(--fail-red-dim)',
                border: '1px solid var(--fail-red-border)', borderRadius: 6,
                color: 'var(--fail-red-light)', fontSize: '0.8rem', marginBottom: '1.25rem',
                fontFamily: 'var(--font-mono)', fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-precision-amber"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              }}
            >
              {loading ? 'AUTHENTICATING ENCRYPTED SESSION...' : 'AUTHORIZE & INITIALIZE WORKSTATION'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Terminal Footer Status */}
          <div style={{
            marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--pass-green-light)', fontWeight: 600 }}>
              <span className="pulse-radar-dot" style={{ width: 6, height: 6, background: 'var(--pass-green)' }} /> SECURE GATEWAY
            </span>
            <span>NODE: IN-DEL-METRO-01</span>
          </div>
        </div>
      </div>
    </div>
  );
}
