import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  FlaskConical, ArrowRight, Play, CheckCircle2, XCircle,
  RotateCcw, Clock, Plus, Scale, Sparkles, BookOpen
} from 'lucide-react';

export default function TestingPage() {
  const navigate = useNavigate();
  const { testSessions, instruments, setQuickTestOpen, setExplainerOpen } = useAppStore();

  const [filterType, setFilterType] = useState<string>('all');

  const active = testSessions.filter(s => s.status === 'in_progress' || s.status === 'paused');
  const completed = testSessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime());

  const filteredCompleted = filterType === 'all'
    ? completed
    : completed.filter(s => s.test_type === filterType);

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Hero */}
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FlaskConical size={14} /> OIML R-76 TEST WORKSTATION
          </div>
          <h1 className="page-hero-title">
            Verification Testing Workstation
          </h1>
          <p className="page-hero-subtitle">
            Execute step-by-step metrological testing sequences, record load indications, determine changeover points ($\Delta L$), and evaluate compliance within statutory MPE limits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-precision-amber"
            onClick={() => setQuickTestOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Play size={14} fill="currentColor" /> LAUNCH NEW TEST
          </button>
          <button
            className="btn-precision-ghost"
            onClick={() => setExplainerOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <BookOpen size={14} /> TEST PROCEDURES
          </button>
        </div>
      </div>

      {/* 3 Core Metrology Tests Quick Guide */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
      }}>
        <div style={{ padding: '1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--amber)', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            <Scale size={16} /> 1. WEIGHING PERFORMANCE
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Applies ascending and descending test loads from Min to Max to evaluate linearity and true error ($E$).
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--info-blue-light)', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            <RotateCcw size={16} /> 2. ECCENTRICITY (CORNER)
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Tests ~⅓ Max load on 4 off-center positions and center to verify pan tilt and off-center sensitivity.
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--pass-green-light)', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            <Clock size={16} /> 3. REPEATABILITY
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Repeats identical test loads (10 cycles at ~50% and ~100% capacity) to measure standard deviation.
          </div>
        </div>
      </div>

      {/* In-Progress Testing Section */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <div className="tech-panel-title">
            <span className="pulse-radar-dot" />
            ACTIVE SESSIONS IN PROGRESS ({active.length})
          </div>
          {active.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              AWAITING OPERATOR INPUT
            </span>
          )}
        </div>

        <div className="tech-panel-body" style={{ padding: 0 }}>
          {active.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FlaskConical size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                NO ACTIVE TEST SESSIONS RUNNING
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: 460, margin: '0.35rem auto 1.25rem' }}>
                All previous evaluations have concluded. Select any registered weighing instrument to launch an OIML R-76 verification sequence.
              </p>
              <button
                className="btn-precision-amber"
                onClick={() => setQuickTestOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
              >
                <Play size={13} fill="currentColor" /> LAUNCH TEST NOW
              </button>
            </div>
          ) : (
            <table className="tech-table">
              <thead>
                <tr>
                  <th>INSTRUMENT</th>
                  <th>TEST PROTOCOL</th>
                  <th>ATTEMPT</th>
                  <th>OPERATOR</th>
                  <th>PROGRESS</th>
                  <th>STARTED</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {active.map(s => {
                  const inst = instruments.find(i => i.id === s.instrument_id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {inst?.serial_number || inst?.instrument_id}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {inst?.manufacturer} {inst?.model}
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {s.test_type}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        Attempt #{s.attempts.length}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {s.operator_name || 'Operator'}
                      </td>
                      <td style={{ width: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.progress}%`, background: 'var(--amber)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--amber-light)', fontWeight: 700 }}>
                            {s.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-precision-amber"
                          onClick={() => navigate(`/testing/${s.id}`)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          CONTINUE <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Completed Tests History Section */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <div className="tech-panel-title">
            <CheckCircle2 size={15} color="var(--pass-green)" />
            COMPLETED AUDIT EVALUATIONS ({completed.length})
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'accuracy', 'eccentricity', 'repeatability'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`btn-precision-ghost ${filterType === type ? 'active' : ''}`}
                style={{
                  fontSize: '0.7rem', padding: '0.25rem 0.55rem',
                  textTransform: 'capitalize',
                  background: filterType === type ? 'rgba(255,255,255,0.1)' : undefined,
                  borderColor: filterType === type ? 'var(--slate-border-light)' : undefined
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="tech-panel-body" style={{ padding: 0 }}>
          {filteredCompleted.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>NO COMPLETED TESTS MATCHING FILTER</div>
            </div>
          ) : (
            <table className="tech-table">
              <thead>
                <tr>
                  <th>INSTRUMENT</th>
                  <th>TEST PROTOCOL</th>
                  <th>ATTEMPTS</th>
                  <th>OPERATOR</th>
                  <th>VERDICT</th>
                  <th>COMPLETED AT</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompleted.map(s => {
                  const inst = instruments.find(i => i.id === s.instrument_id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {inst?.serial_number || inst?.instrument_id}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {inst?.manufacturer} {inst?.model}
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {s.test_type}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {s.attempts.length > 1 && <RotateCcw size={11} color="var(--amber)" />}
                          {s.attempts.length} cycle{s.attempts.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {s.operator_name}
                      </td>
                      <td>
                        {s.result === 'pass' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                            color: 'var(--pass-green-light)', background: 'var(--pass-green-dim)',
                            padding: '0.15rem 0.5rem', borderRadius: 3, border: '1px solid var(--pass-green-border)'
                          }}>
                            <CheckCircle2 size={11} /> PASS
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                            color: 'var(--fail-red-light)', background: 'var(--fail-red-dim)',
                            padding: '0.15rem 0.5rem', borderRadius: 3, border: '1px solid var(--fail-red-border)'
                          }}>
                            <XCircle size={11} /> FAIL
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(s.completed_at || '').toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-precision-ghost"
                          onClick={() => navigate(`/testing/${s.id}`)}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                        >
                          INSPECT
                        </button>
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
  );
}
