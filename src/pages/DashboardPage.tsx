import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  Scale, FlaskConical, CheckCircle2, XCircle,
  ArrowRight, Plus, FileText, Play, BookOpen,
  Activity, Sparkles
} from 'lucide-react';
import InstrumentRegistrationModal from '../components/InstrumentRegistrationModal';
import OnboardingBanner from '../components/OnboardingBanner';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    dashboardMetrics: m, testSessions, instruments, reports,
    recalculateMetrics, setQuickTestOpen, setExplainerOpen, setTourOpen,
    startTestingForInstrument
  } = useAppStore();

  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    recalculateMetrics();
  }, []);

  const activeSessions = testSessions.filter(s => s.status === 'in_progress');
  const primaryActive = activeSessions[0];
  const primaryInstrument = instruments.find(i => i.id === primaryActive?.instrument_id);

  const completedSessions = testSessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
    .slice(0, 4);

  const recentReports = reports
    .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())
    .slice(0, 4);

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ONBOARDING BANNER */}
      <OnboardingBanner
        onStartTour={() => setTourOpen(true)}
        onQuickTest={() => setQuickTestOpen(true)}
        onOpenExplainer={() => setExplainerOpen(true)}
      />

      {/* PAGE HERO HEADER */}
      <div className="page-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.4rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--purple)',
              background: 'var(--purple-dim)',
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid var(--purple-border)',
              fontFamily: 'var(--font-mono)'
            }}>
              OIML R-76 STANDARD
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Non-Automatic Weighing Instruments
            </span>
          </div>

          <h1 className="page-hero-title">
            Weighing Scale Verification
          </h1>
          <p className="page-hero-subtitle">
            Quickly test weighing scales, verify statutory error limits (MPE), and generate official compliance test reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-precision-amber"
            onClick={() => setQuickTestOpen(true)}
          >
            <Play size={14} fill="currentColor" /> START A TEST
          </button>

          <button
            className="btn-precision-ghost"
            onClick={() => setShowRegister(true)}
          >
            <Plus size={14} /> REGISTER SCALE
          </button>

          <button
            className="btn-precision-ghost"
            onClick={() => setExplainerOpen(true)}
          >
            <BookOpen size={14} /> OIML GUIDE
          </button>
        </div>
      </div>

      {/* 4 ESSENTIAL METRICS */}
      <div className="metrics-quad">
        <div
          className="metric-counter-tile"
          onClick={() => navigate('/instruments')}
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-meta">
            <span className="metric-label">SCALES IN LAB</span>
            <Scale size={18} color="var(--purple)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits">{instruments.length}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--purple)', fontWeight: 600 }}>Active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Class I, II, III & IIII scales
          </div>
        </div>

        <div
          className="metric-counter-tile"
          onClick={() => navigate('/testing')}
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-meta">
            <span className="metric-label">TESTS EXECUTED</span>
            <FlaskConical size={18} color="var(--purple)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits">{testSessions.length}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--pass-green-light)', fontWeight: 600 }}>
              {activeSessions.length} In Progress
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Weighing, Eccentricity, Repeatability
          </div>
        </div>

        <div className="metric-counter-tile">
          <div className="metric-meta">
            <span className="metric-label">PASS RATE</span>
            <CheckCircle2 size={18} color="var(--pass-green)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits" style={{ color: 'var(--pass-green-light)' }}>
              {m.compliance_percentage || 85.7}%
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--pass-green-light)',
              background: 'var(--pass-green-dim)',
              padding: '2px 6px',
              borderRadius: 3
            }}>
              WITHIN MPE
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Statutory legal tolerances
          </div>
        </div>

        <div
          className="metric-counter-tile"
          onClick={() => navigate('/reports')}
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-meta">
            <span className="metric-label">CERTIFICATES</span>
            <FileText size={18} color="var(--purple)" />
          </div>
          <div className="metric-value-row">
            <div className="metric-digits">{reports.length}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--purple)', fontWeight: 600 }}>Verified</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Official OIML R-76-2 PDFs
          </div>
        </div>
      </div>

      {/* ACTIVE TEST RESUME ALERT (IF ANY TEST RUNNING) */}
      {primaryActive && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff',
          border: '1px solid #c4b5fd',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 8,
              background: '#ede9fe',
              color: 'var(--purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--purple)' }}>
                ACTIVE TEST IN PROGRESS ({primaryActive.progress}%)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                {primaryActive.test_type?.toUpperCase()} TEST · {primaryInstrument?.manufacturer} {primaryInstrument?.model}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Operator: {primaryActive.operator_name || 'A. Sharma'} · Serial: {primaryInstrument?.serial_number}
              </div>
            </div>
          </div>

          <button
            className="btn-precision-amber"
            onClick={() => navigate(`/testing/${primaryActive.id}`)}
          >
            RESUME TEST <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* QUICK WEIGHING SCALES TABLE */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <div className="tech-panel-title">
            <Scale size={16} color="var(--purple)" />
            REGISTERED WEIGHING SCALES
          </div>
          <button
            className="btn-precision-ghost"
            onClick={() => navigate('/instruments')}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            View All ({instruments.length}) <ArrowRight size={12} />
          </button>
        </div>

        <div className="tech-panel-body" style={{ padding: 0 }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>SERIAL / ID</th>
                <th>SCALE MODEL</th>
                <th>CLASS</th>
                <th>MAX CAPACITY</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {instruments.slice(0, 4).map(inst => {
                const activeSession = testSessions.find(s => s.instrument_id === inst.id && s.status === 'in_progress');

                return (
                  <tr key={inst.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/instruments/${inst.id}`)}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {inst.serial_number}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {inst.instrument_id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{inst.manufacturer} {inst.model}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inst.location}</div>
                    </td>

                    <td>
                      <span className={`badge-class-${inst.accuracy_class.toLowerCase()}`}>
                        CLASS {inst.accuracy_class}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {inst.max_capacity?.toLocaleString()} {inst.unit}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        (e = {inst.verification_interval} {inst.unit})
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: inst.status === 'compliant' ? 'var(--pass-green-dim)' : 'var(--purple-dim)',
                        color: inst.status === 'compliant' ? 'var(--pass-green-light)' : 'var(--purple)',
                        border: `1px solid ${inst.status === 'compliant' ? 'var(--pass-green-border)' : 'var(--purple-border)'}`
                      }}>
                        {inst.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                        {activeSession ? (
                          <button
                            className="btn-precision-amber"
                            onClick={() => navigate(`/testing/${activeSession.id}`)}
                            style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                          >
                            <Play size={11} fill="currentColor" /> Resume
                          </button>
                        ) : (
                          <button
                            className="btn-precision-amber"
                            onClick={() => {
                              const sid = startTestingForInstrument(inst.id, 'accuracy');
                              navigate(`/testing/${sid}`);
                            }}
                            style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                          >
                            <Play size={11} fill="currentColor" /> Test Scale
                          </button>
                        )}
                        <button
                          className="btn-precision-ghost"
                          onClick={() => navigate(`/instruments/${inst.id}`)}
                          style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                        >
                          Specs
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT CERTIFICATES */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <div className="tech-panel-title">
            <FileText size={16} color="var(--purple)" />
            RECENT OFFICIAL CERTIFICATES
          </div>
          <button
            className="btn-precision-ghost"
            onClick={() => navigate('/reports')}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            All Reports ({reports.length}) <ArrowRight size={12} />
          </button>
        </div>

        <div className="tech-panel-body" style={{ padding: 0 }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>CERTIFICATE #</th>
                <th>SCALE</th>
                <th>COMPLIANCE</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map(rep => (
                <tr key={rep.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/reports/${rep.id}`)}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {rep.report_number}
                  </td>
                  <td>
                    {rep.instrument.manufacturer} {rep.instrument.model}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: rep.compliance_result === 'pass' ? 'var(--pass-green-dim)' : 'var(--fail-red-dim)',
                      color: rep.compliance_result === 'pass' ? 'var(--pass-green-light)' : 'var(--fail-red-light)',
                      border: `1px solid ${rep.compliance_result === 'pass' ? 'var(--pass-green-border)' : 'var(--fail-red-border)'}`
                    }}>
                      {rep.compliance_result.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(rep.generated_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-precision-ghost"
                      onClick={(e) => { e.stopPropagation(); navigate(`/reports/${rep.id}`); }}
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                    >
                      View PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRegister && <InstrumentRegistrationModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
