import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  Scale, FlaskConical, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, Clock, Plus, FileText, RotateCcw, Activity,
  Database, ShieldCheck, HardDrive, Cpu, Radio, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InstrumentRegistrationModal from '../components/InstrumentRegistrationModal';

function AnimatedCounter({ value, suffix = '', precision = 0 }: { value: number; suffix?: string; precision?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * easeProgress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {precision === 0 ? Math.round(display) : display.toFixed(precision)}
      {suffix}
    </span>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardMetrics: m, testSessions, instruments, recalculateMetrics } = useAppStore();
  const [showRegister, setShowRegister] = useState(false);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  useEffect(() => {
    recalculateMetrics();
  }, []);

  const activeSessions = testSessions.filter(s => s.status === 'in_progress');
  const primaryActive = activeSessions[0] || testSessions[0];
  const primaryInstrument = instruments.find(i => i.id === primaryActive?.instrument_id);

  const completedSessions = testSessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
    .slice(0, 6);

  return (
    <div className="animate-entrance">
      {/* PAGE HERO HEADER */}
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-radar-dot" style={{ width: 6, height: 6 }} /> REAL-TIME METROLOGY TELEMETRY
          </div>
          <h1 className="page-hero-title">
            TESTING CONTROL
          </h1>
          <p className="page-hero-subtitle">
            Real-time overview of instrument evaluation, automated verification cycles, and OIML R-76 compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-precision-ghost" onClick={() => navigate('/reports')}>
            <FileText size={14} /> CERTIFICATES
          </button>
          <button className="btn-precision-amber" onClick={() => setShowRegister(true)}>
            <Plus size={14} /> REGISTER INSTRUMENT
          </button>
        </div>
      </div>

      {/* LIVE SYSTEM STATUS PANEL */}
      <div className="telemetry-strip">
        <div className="telemetry-item">
          <span className="telemetry-label">SYSTEM:</span>
          <span className="telemetry-val">
            <span className="telemetry-dot" /> OPERATIONAL
          </span>
        </div>
        <div className="telemetry-divider" />

        <div className="telemetry-item">
          <span className="telemetry-label">DATABASE:</span>
          <span className="telemetry-val">
            <span className="telemetry-dot" /> CONNECTED (LOCAL-STORE V2)
          </span>
        </div>
        <div className="telemetry-divider" />

        <div className="telemetry-item">
          <span className="telemetry-label">RULE ENGINE:</span>
          <span className="telemetry-val">
            <span className="telemetry-dot amber" /> R-76 ACTIVE (CLAUSE 3.5)
          </span>
        </div>
        <div className="telemetry-divider" />

        <div className="telemetry-item">
          <span className="telemetry-label">STORAGE:</span>
          <span className="telemetry-val">
            <HardDrive size={13} color="var(--steel-light)" /> 98.4% AVAILABLE
          </span>
        </div>
        <div className="telemetry-divider" />

        <div className="telemetry-item">
          <span className="telemetry-label">AUDIT:</span>
          <span className="telemetry-val">
            <span className="telemetry-dot" /> RECORDING (ENCRYPTED)
          </span>
        </div>
      </div>

      {/* ACTIVE TESTING HERO VISUALIZATION */}
      {primaryActive && (
        <div className="active-testing-hero" style={{ marginBottom: '2rem' }}>
          {/* Radial animated progress circle */}
          <div className="hero-radial-gauge">
            <svg width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="var(--amber)"
                strokeWidth="8"
                strokeDasharray="314.159"
                initial={{ strokeDashoffset: 314.159 }}
                animate={{ strokeDashoffset: 314.159 * (1 - (primaryActive.progress || 72) / 100) }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
              />
            </svg>
            <div className="radial-percentage">
              <AnimatedCounter value={primaryActive.progress || 72} suffix="%" />
            </div>
          </div>

          {/* Active test metadata */}
          <div className="hero-info-block">
            <div className="hero-tag">
              <Activity size={14} /> ACTIVE VERIFICATION SESSION
            </div>
            <div className="hero-heading">
              {primaryActive.test_type?.toUpperCase()} TEST · {primaryInstrument?.serial_number || 'W-2026-014'}
            </div>
            <div className="hero-instrument-specs">
              <span><strong>INSTRUMENT:</strong> {primaryInstrument?.manufacturer} {primaryInstrument?.model}</span>
              <span><strong>CLASS:</strong> {primaryInstrument?.accuracy_class}</span>
              <span><strong>OPERATOR:</strong> {primaryActive.operator_name || 'A. Sharma'}</span>
              <span><strong>STARTED:</strong> {new Date(primaryActive.started_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Horizontal precision progress bar */}
            <div style={{ marginTop: '0.5rem', width: '100%', maxWidth: 540 }}>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--amber-dark), var(--amber-light))', borderRadius: 3 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${primaryActive.progress || 72}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div>
            <button
              className="btn-precision-amber"
              onClick={() => navigate(`/testing/${primaryActive.id}`)}
              style={{ padding: '0.85rem 1.6rem', fontSize: '0.85rem' }}
            >
              CONTINUE TEST WORKSTATION <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* METRIC VISUALIZATION: TECHNICAL COUNTERS WITH MINI SPARKLINES */}
      <div className="metrics-quad">
        {/* Instruments tile */}
        <div className="metric-counter-tile">
          <div className="metric-meta">
            <span className="metric-label">REGISTERED INSTRUMENTS</span>
            <Scale size={15} color="var(--steel-light)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits">
              <AnimatedCounter value={m.registered_instruments || instruments.length || 128} />
            </div>
            <div className="metric-sparkline-box">
              <svg width="80" height="32" viewBox="0 0 80 32">
                <polyline
                  fill="none"
                  stroke="var(--amber)"
                  strokeWidth="2"
                  points="0,26 15,22 30,24 45,16 60,18 75,6"
                />
                <circle cx="75" cy="6" r="3" fill="var(--amber-light)" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
            +{m.instruments_change || 14} verified this period
          </div>
        </div>

        {/* Tests tile */}
        <div className="metric-counter-tile">
          <div className="metric-meta">
            <span className="metric-label">TOTAL TESTS EXECUTED</span>
            <FlaskConical size={15} color="var(--steel-light)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits">
              <AnimatedCounter value={m.tests_this_month || 246} />
            </div>
            <div className="metric-sparkline-box">
              <svg width="80" height="32" viewBox="0 0 80 32">
                <polyline
                  fill="none"
                  stroke="var(--info-blue)"
                  strokeWidth="2"
                  points="0,28 16,20 32,22 48,12 64,14 75,4"
                />
                <circle cx="75" cy="4" r="3" fill="var(--info-blue-light)" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
            {m.pending_tests || 3} queued in laboratory
          </div>
        </div>

        {/* Pass rate tile */}
        <div className="metric-counter-tile">
          <div className="metric-meta">
            <span className="metric-label">OIML COMPLIANCE PASS RATE</span>
            <CheckCircle2 size={15} color="var(--pass-green)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits" style={{ color: 'var(--pass-green-light)' }}>
              <AnimatedCounter value={m.compliance_percentage || 91.4} suffix="%" precision={1} />
            </div>
            <div className="metric-sparkline-box">
              <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="var(--pass-green)"
                  strokeWidth="3"
                  strokeDasharray="75.4"
                  strokeDashoffset={75.4 * (1 - (m.compliance_percentage || 91.4) / 100)}
                />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
            Strictly within ±MPE tolerances
          </div>
        </div>

        {/* Retests tile */}
        <div className="metric-counter-tile">
          <div className="metric-meta">
            <span className="metric-label">RETEST SESSIONS PRESERVED</span>
            <RotateCcw size={15} color="var(--amber)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits" style={{ color: 'var(--amber-light)' }}>
              <AnimatedCounter value={m.tests_requiring_attention || 18} />
            </div>
            <div className="metric-sparkline-box">
              <svg width="80" height="32" viewBox="0 0 80 32">
                <line x1="10" y1="28" x2="10" y2="18" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
                <line x1="28" y1="28" x2="28" y2="12" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
                <line x1="46" y1="28" x2="46" y2="22" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
                <line x1="64" y1="28" x2="64" y2="8" stroke="var(--amber-light)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
            Multi-attempt audit integrity preserved
          </div>
        </div>
      </div>

      {/* SPLIT WORKBENCH: ACTIVE TEST VISUALIZATION & RECENT AUDIT RESULTS */}
      <div className="split-workbench">
        {/* Active Tests Workstation */}
        <div className="tech-panel">
          <div className="tech-panel-header">
            <div className="tech-panel-title">
              <Activity size={14} color="var(--amber)" />
              ACTIVE TEST SESSIONS MATRIX
            </div>
            <button className="btn-precision-ghost" onClick={() => navigate('/testing')} style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}>
              VIEW ALL <ArrowRight size={12} />
            </button>
          </div>

          <div className="tech-panel-body" style={{ padding: 0 }}>
            {activeSessions.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FlaskConical size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>ALL TESTING SESSIONS COMPLETED</div>
                <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Launch a new test sequence from the Instruments registry.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeSessions.map((session, idx) => {
                  const inst = instruments.find(i => i.id === session.instrument_id);
                  const isHovered = hoveredSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      onMouseEnter={() => setHoveredSessionId(session.id)}
                      onMouseLeave={() => setHoveredSessionId(null)}
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: isHovered ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/testing/${session.id}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {session.test_type?.toUpperCase()} TEST
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--amber)', marginLeft: '0.75rem' }}>
                            {inst?.serial_number || inst?.instrument_id}
                          </span>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800,
                          color: session.progress === 100 ? 'var(--pass-green-light)' : 'var(--amber-light)'
                        }}>
                          {session.progress}%
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${session.progress}%`,
                            background: session.progress === 100 ? 'var(--pass-green)' : 'var(--amber)',
                            borderRadius: 3,
                          }}
                        />
                      </div>

                      {/* Expandable row telemetry revealed on hover */}
                      {isHovered && (
                        <div
                          className="animate-entrance"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '0.85rem',
                            paddingTop: '0.65rem',
                            borderTop: '1px solid var(--slate-border)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span>OPERATOR: {session.operator_name}</span>
                          <span>CLASS: {inst?.accuracy_class}</span>
                          <span>ATTEMPTS: {session.attempts?.length || 1}</span>
                          <span style={{ color: 'var(--amber)', fontWeight: 600 }}>ENTER WORKSTATION →</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Evaluations */}
        <div className="tech-panel">
          <div className="tech-panel-header">
            <div className="tech-panel-title">
              <CheckCircle2 size={14} color="var(--pass-green)" />
              RECENT AUDITED RESULTS
            </div>
            <span className="text-tech">OIML R-76 LOG</span>
          </div>

          <div className="tech-panel-body" style={{ padding: 0 }}>
            {completedSessions.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>NO COMPLETED TESTS ARCHIVED</div>
              </div>
            ) : (
              <table className="tech-table">
                <thead>
                  <tr>
                    <th>IDENTIFIER</th>
                    <th>TYPE</th>
                    <th>ATTEMPTS</th>
                    <th>VERDICT</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSessions.map(session => {
                    const inst = instruments.find(i => i.id === session.instrument_id);
                    return (
                      <tr
                        key={session.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/instruments/${session.instrument_id}`)}
                      >
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>
                          {inst?.serial_number || inst?.instrument_id}
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                          {session.test_type}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {session.attempts?.length > 1 && <RotateCcw size={11} color="var(--amber)" />}
                            {session.attempts?.length || 1}
                          </span>
                        </td>
                        <td>
                          {session.result === 'pass' ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                              color: 'var(--pass-green-light)', background: 'var(--pass-green-dim)',
                              padding: '0.15rem 0.45rem', borderRadius: 3, border: '1px solid var(--pass-green-border)'
                            }}>
                              <CheckCircle2 size={11} /> PASS
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                              color: 'var(--fail-red-light)', background: 'var(--fail-red-dim)',
                              padding: '0.15rem 0.45rem', borderRadius: 3, border: '1px solid var(--fail-red-border)'
                            }}>
                              <XCircle size={11} /> FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showRegister && <InstrumentRegistrationModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
