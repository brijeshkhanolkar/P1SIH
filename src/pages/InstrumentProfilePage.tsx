import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { generateTestLoads } from '../lib/r76-engine';
import {
  Scale, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Clock,
  Play, FileText, Upload, Eye, RotateCcw, Settings, ChevronRight,
  Check, X as XIcon, Shield, Radio, Layers
} from 'lucide-react';
import { motion } from 'motion/react';

export default function InstrumentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useAppStore();
  const instrument = store.instruments.find(i => i.id === id);
  const config = store.configurations.find(c => c.instrument_id === id);
  const testPlan = store.testPlans.find(p => p.instrument_id === id);
  const sessions = store.testSessions.filter(s => s.instrument_id === id);
  const evidence = store.evidence.filter(e => e.instrument_id === id);
  const reports = store.reports.filter(r => r.instrument_id === id);
  const auditLogs = store.auditLogs.filter(l => l.entity_id === id || sessions.some(s => s.id === l.entity_id));

  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'plan' | 'history' | 'evidence' | 'reports' | 'audit'>('overview');

  if (!instrument) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Scale size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>INSTRUMENT NOT FOUND</div>
        <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>The requested instrument identifier does not exist in the repository.</p>
        <button className="btn-precision-ghost" style={{ marginTop: '1rem' }} onClick={() => navigate('/instruments')}>
          <ArrowLeft size={14} /> BACK TO REGISTRY
        </button>
      </div>
    );
  }

  const handleConfigure = () => {
    store.saveConfiguration(instrument.id, {
      accuracy_class: instrument.accuracy_class,
      max_capacity: instrument.max_capacity,
      verification_interval: instrument.verification_interval,
      num_verification_intervals: instrument.num_verification_intervals,
      min_capacity: instrument.min_capacity,
      unit: instrument.unit,
      rule_version_id: 'r76-v1',
    });
    setActiveTab('config');
  };

  const handleGenerateTestPlan = () => {
    if (!config) handleConfigure();
    store.generateTestPlan(instrument.id);
    setActiveTab('plan');
  };

  const handleStartTest = (testType: string) => {
    const plan = store.testPlans.find(p => p.instrument_id === id);
    if (!plan) return;
    const session = store.startTestSession(plan.id, testType as any);
    navigate(`/testing/${session.id}`);
  };

  const handleGenerateReport = () => {
    const report = store.generateReport(instrument.id, 'standard');
    navigate(`/reports/${report.id}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      store.addEvidence({
        instrument_id: instrument.id,
        file_name: file.name,
        file_type: file.type || 'unknown',
        file_size: file.size,
        file_url: URL.createObjectURL(file),
        uploaded_by: store.currentUser?.id || 'operator',
        uploaded_by_name: store.currentUser?.full_name || 'Operator',
      });
    });
    e.target.value = '';
  };

  const configChecks = config ? [
    { label: 'Accuracy Class defined per OIML R-76 Table 3', valid: !!config.accuracy_class },
    { label: 'Maximum Capacity (Max) configured', valid: config.max_capacity > 0 },
    { label: 'Verification Scale Interval (e) defined', valid: config.verification_interval > 0 },
    { label: 'Scale Resolution Ratio (n = Max/e ≥ 100) compliant', valid: config.num_verification_intervals >= 100 },
    { label: 'Minimum Capacity (Min) threshold established', valid: config.min_capacity >= 0 },
    { label: 'Regulatory Rule Set: OIML R-76:2006 active', valid: !!config.rule_version_id },
  ] : [];

  return (
    <div className="animate-entrance">
      {/* Top back navigation */}
      <button
        className="btn-precision-ghost"
        onClick={() => navigate('/instruments')}
        style={{ marginBottom: '1.25rem', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
      >
        <ArrowLeft size={14} /> BACK TO INSTRUMENT DIRECTORY
      </button>

      {/* LARGE INSTRUMENT IDENTIFICATION & TECHNICAL BLUEPRINT HERO */}
      <div className="tech-panel" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        {/* Header Ribbon */}
        <div style={{
          padding: '1.75rem 2rem',
          borderBottom: '1px solid var(--slate-border)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(18, 24, 33, 0.95), rgba(13, 17, 23, 0.98))',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge-class-i" style={{ background: 'var(--amber-dim)', color: 'var(--amber-light)', borderColor: 'var(--amber-border)' }}>
                {instrument.instrument_type.toUpperCase()}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                color: instrument.status === 'under_test' ? 'var(--amber-light)' : 'var(--pass-green-light)',
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span className="pulse-radar-dot" style={{ width: 6, height: 6 }} />
                {instrument.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 800,
              letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1
            }}>
              {instrument.serial_number || instrument.instrument_id}
            </h1>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {instrument.manufacturer} · {instrument.model} — Located at {instrument.location} ({instrument.owner_organization})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!config && (
              <button className="btn-precision-ghost" onClick={handleConfigure}>
                <Settings size={14} /> CONFIGURE PARAMETERS
              </button>
            )}
            {config && !testPlan && (
              <button className="btn-precision-amber" onClick={handleGenerateTestPlan}>
                <Play size={14} /> GENERATE R-76 TEST PLAN
              </button>
            )}
            {sessions.some(s => s.status === 'completed') && (
              <button className="btn-precision-ghost" onClick={handleGenerateReport}>
                <FileText size={14} /> GENERATE REPORT
              </button>
            )}
          </div>
        </div>

        {/* CLEAN ENGINEERING-STYLE SVG TECHNICAL ILLUSTRATION WITH MEASUREMENT CALLOUTS */}
        <div style={{
          padding: '2.5rem 2rem',
          background: 'rgba(8, 10, 15, 0.65)',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '2.5rem',
          alignItems: 'center',
        }}>
          {/* Engineering Blueprint Drawing */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.75rem'
            }}>
              <span>SCHEMATIC ELEVATION: PRECISION NON-AUTOMATIC WEIGHING SYSTEM</span>
              <span style={{ color: 'var(--amber)' }}>SCALE RATIO 1:1 CALIBRATED</span>
            </div>

            <svg width="100%" height="220" viewBox="0 0 540 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Level surface datum */}
              <line x1="20" y1="195" x2="520" y2="195" stroke="#1f2937" strokeWidth="2" strokeDasharray="4 4" />
              <text x="25" y="210" fill="#4b5563" fontFamily="var(--font-mono)" fontSize="9">GROUND DATUM PLANE (g=9.792 m/s²)</text>

              {/* Adjustable Leveling Feet */}
              <circle cx="80" cy="188" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
              <circle cx="460" cy="188" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
              <line x1="80" y1="180" x2="80" y2="160" stroke="#f59e0b" strokeWidth="2" />
              <line x1="460" y1="180" x2="460" y2="160" stroke="#f59e0b" strokeWidth="2" />

              {/* Base Chassis Housing */}
              <rect x="60" y="130" width="420" height="30" rx="3" fill="#111822" stroke="#2d3b4e" strokeWidth="1.5" />
              
              {/* Digital Indicator Console Display */}
              <rect x="360" y="135" width="105" height="20" rx="2" fill="#080c12" stroke="#f59e0b" strokeWidth="1" />
              <text x="375" y="149" fill="#10b981" fontFamily="var(--font-mono)" fontSize="11" fontWeight="bold">0.0000 g</text>
              <circle cx="450" cy="145" r="2.5" fill="#f59e0b" />

              {/* Spirit Level Bubble */}
              <circle cx="100" cy="145" r="7" fill="#080c12" stroke="#64748b" strokeWidth="1" />
              <circle cx="100" cy="145" r="2" fill="#10b981" />

              {/* Strain-Gauge Load Cell Sensor Column */}
              <rect x="235" y="65" width="70" height="65" rx="3" fill="#16202c" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="270" cy="98" r="9" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="1.5" />
              <path d="M 255 98 L 285 98 M 270 83 L 270 113" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

              {/* Stainless Steel Weighing Pan (Receptor) */}
              <rect x="110" y="55" width="320" height="10" rx="2" fill="#1f2937" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="110" y1="65" x2="235" y2="90" stroke="#374151" strokeDasharray="3 3" />
              <line x1="430" y1="65" x2="305" y2="90" stroke="#374151" strokeDasharray="3 3" />

              {/* Dynamic Callout Arrows */}
              <circle cx="270" cy="55" r="4" fill="#f59e0b" />
              <line x1="270" y1="55" x2="270" y2="25" stroke="#f59e0b" strokeWidth="1" />
              <rect x="220" y="10" width="100" height="18" rx="2" fill="#080a0f" stroke="#f59e0b" strokeWidth="1" />
              <text x="230" y="23" fill="#f59e0b" fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold">LOAD RECEPTOR</text>
            </svg>
          </div>

          {/* Precision Readout Matrix (Requested: MAX, e, CLASS, n) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="metric-counter-tile" style={{ padding: '1rem' }}>
              <div className="metric-meta">
                <span className="metric-label">MAX CAPACITY</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {instrument.max_capacity?.toLocaleString()} {instrument.unit}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Full scale rating
              </div>
            </div>

            <div className="metric-counter-tile" style={{ padding: '1rem' }}>
              <div className="metric-meta">
                <span className="metric-label">INTERVAL (e)</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-light)' }}>
                {instrument.verification_interval} {instrument.unit}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Verification scale interval
              </div>
            </div>

            <div className="metric-counter-tile" style={{ padding: '1rem' }}>
              <div className="metric-meta">
                <span className="metric-label">ACCURACY CLASS</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--pass-green-light)' }}>
                CLASS {instrument.accuracy_class}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                OIML R-76 classification
              </div>
            </div>

            <div className="metric-counter-tile" style={{ padding: '1rem' }}>
              <div className="metric-meta">
                <span className="metric-label">RESOLUTION (n)</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--info-blue-light)' }}>
                {instrument.num_verification_intervals?.toLocaleString() || Math.round(instrument.max_capacity / instrument.verification_interval).toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                n = Max ÷ e (intervals)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENGINEERING SUBTABS */}
      <div className="tabs-container">
        {(['overview', 'config', 'plan', 'history', 'evidence', 'reports', 'audit'] as const).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'config' ? '02 CONFIGURATION' :
             tab === 'plan' ? '03 TEST PLAN' :
             tab === 'history' ? '04 TEST HISTORY' :
             tab === 'evidence' ? '05 EVIDENCE' :
             tab === 'reports' ? '06 REPORTS' :
             tab === 'audit' ? '07 AUDIT TRAIL' : '01 OVERVIEW'}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="split-workbench">
          <div className="tech-panel">
            <div className="tech-panel-header">
              <div className="tech-panel-title">TECHNICAL SPECIFICATIONS</div>
              <span className="text-tech">METROLOGICAL DATA</span>
            </div>
            <div className="tech-panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                <div><span style={{ color: 'var(--text-dim)' }}>INSTRUMENT TYPE:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{instrument.instrument_type}</div></div>
                <div><span style={{ color: 'var(--text-dim)' }}>MANUFACTURER:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{instrument.manufacturer}</div></div>
                <div><span style={{ color: 'var(--text-dim)' }}>MODEL:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{instrument.model}</div></div>
                <div><span style={{ color: 'var(--text-dim)' }}>SERIAL NUMBER:</span> <div style={{ color: 'var(--amber)', fontWeight: 700 }}>{instrument.serial_number}</div></div>
                <div><span style={{ color: 'var(--text-dim)' }}>MIN CAPACITY:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{instrument.min_capacity} {instrument.unit}</div></div>
                <div><span style={{ color: 'var(--text-dim)' }}>RECEIVED DATE:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{new Date(instrument.date_received).toLocaleDateString()}</div></div>
              </div>
            </div>
          </div>

          <div className="tech-panel">
            <div className="tech-panel-header">
              <div className="tech-panel-title">VERIFICATION SESSIONS SUMMARY</div>
              <span className="text-tech">{sessions.length} SESSIONS</span>
            </div>
            <div className="tech-panel-body" style={{ padding: 0 }}>
              {sessions.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No test sessions initiated yet.
                </div>
              ) : (
                <table className="tech-table">
                  <thead>
                    <tr><th>TEST</th><th>ATTEMPTS</th><th>VERDICT</th></tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/testing/${s.id}`)}>
                        <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{s.test_type} Test</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{s.attempts?.length || 1}</td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                            color: s.result === 'pass' ? 'var(--pass-green-light)' : 'var(--amber-light)',
                          }}>
                            {s.result?.toUpperCase() || s.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="split-workbench">
          <div className="tech-panel">
            <div className="tech-panel-header">
              <div className="tech-panel-title">ACTIVE R-76 CONFIGURATION</div>
              <span className="text-tech">CLAUSE 3.5 APPLIED</span>
            </div>
            <div className="tech-panel-body">
              {config ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-dim)' }}>ACCURACY CLASS:</span> <div style={{ color: 'var(--amber)', fontWeight: 700 }}>CLASS {config.accuracy_class}</div></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>MAX CAPACITY:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{config.max_capacity} {config.unit}</div></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>INTERVAL (e):</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{config.verification_interval} {config.unit}</div></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>MIN CAPACITY:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{config.min_capacity} {config.unit}</div></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>RULE VERSION:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{store.activeRuleVersion.name}</div></div>
                  <div><span style={{ color: 'var(--text-dim)' }}>CONFIGURED AT:</span> <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{new Date(config.configured_at).toLocaleDateString()}</div></div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <button className="btn-precision-amber" onClick={handleConfigure}>INITIALIZE CONFIGURATION</button>
                </div>
              )}
            </div>
          </div>

          <div className="tech-panel">
            <div className="tech-panel-header">
              <div className="tech-panel-title">REGULATORY VALIDATION CHECKS</div>
              <span className="text-tech">{configChecks.filter(c => c.valid).length} / {configChecks.length} VALID</span>
            </div>
            <div className="tech-panel-body">
              {configChecks.map((chk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                  {chk.valid ? <CheckCircle2 size={16} color="var(--pass-green)" /> : <XCircle size={16} color="var(--fail-red)" />}
                  <span style={{ color: chk.valid ? 'var(--text-primary)' : 'var(--text-dim)' }}>{chk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEST PLAN */}
      {activeTab === 'plan' && (
        <div className="tech-panel">
          <div className="tech-panel-header">
            <div className="tech-panel-title">MISSION SEQUENCE: OIML R-76 TEST PLAN</div>
            <span className="text-tech">ACTIVE SEQUENCER</span>
          </div>
          <div className="tech-panel-body" style={{ padding: 0 }}>
            {testPlan ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {testPlan.tests.map((test, i) => {
                  const session = sessions.find(s => s.test_type === test.test_type);
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '1.25rem 1.75rem',
                        borderBottom: '1px solid var(--slate-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 4, background: 'var(--bg-void)',
                          border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                          fontWeight: 700, color: 'var(--amber)'
                        }}>
                          0{test.sequence}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {test.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                            {test.required_measurements} verification points · {test.estimated_duration_minutes} min duration
                          </div>
                        </div>
                      </div>

                      <div>
                        {session ? (
                          <button
                            className="btn-precision-amber"
                            onClick={() => navigate(`/testing/${session.id}`)}
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.75rem' }}
                          >
                            CONTINUE WORKSTATION <ChevronRight size={14} />
                          </button>
                        ) : (
                          <button
                            className="btn-precision-ghost"
                            onClick={() => handleStartTest(test.test_type)}
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.75rem' }}
                          >
                            LAUNCH TEST <Play size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <button className="btn-precision-amber" onClick={handleGenerateTestPlan}>GENERATE R-76 TEST PLAN</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEST HISTORY */}
      {activeTab === 'history' && (
        <div className="tech-panel">
          <div className="tech-panel-header">
            <div className="tech-panel-title">VERIFICATION HISTORY & ATTEMPTS</div>
          </div>
          <div className="tech-panel-body" style={{ padding: 0 }}>
            {sessions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                No completed test history recorded.
              </div>
            ) : (
              sessions.map(s => (
                <div key={s.id} style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--slate-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'capitalize' }}>{s.test_type} Test</span>
                    <span className="text-tech-amber">{s.attempts?.length || 1} ATTEMPTS</span>
                  </div>
                  {s.attempts.map(att => (
                    <div key={att.id} style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Attempt #{att.attempt_number} · Result: <strong style={{ color: att.result === 'pass' ? 'var(--pass-green-light)' : 'var(--fail-red-light)' }}>{att.result?.toUpperCase()}</strong> ({att.measurements?.length || 0} measurements)
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="tech-panel">
          <div className="tech-panel-header">
            <div className="tech-panel-title">LABORATORY EVIDENCE & ATTACHMENTS</div>
            <label className="btn-precision-amber" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              <Upload size={13} /> UPLOAD EVIDENCE
              <input type="file" multiple hidden onChange={handleFileUpload} />
            </label>
          </div>
          <div className="tech-panel-body" style={{ padding: 0 }}>
            {evidence.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                No attachments or evidence files uploaded yet.
              </div>
            ) : (
              <table className="tech-table">
                <thead>
                  <tr><th>FILE NAME</th><th>TYPE</th><th>SIZE</th><th>UPLOADED BY</th></tr>
                </thead>
                <tbody>
                  {evidence.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.file_name}</td>
                      <td className="text-tech">{e.file_type}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{(e.file_size / 1024).toFixed(1)} KB</td>
                      <td>{e.uploaded_by_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: REPORTS */}
      {activeTab === 'reports' && (
        <div className="tech-panel">
          <div className="tech-panel-header">
            <div className="tech-panel-title">OFFICIAL TEST REPORTS</div>
          </div>
          <div className="tech-panel-body" style={{ padding: 0 }}>
            {reports.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                No official reports compiled for this instrument.
              </div>
            ) : (
              <table className="tech-table">
                <thead>
                  <tr><th>REPORT NUMBER</th><th>VERDICT</th><th>GENERATED AT</th><th></th></tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.report_number}</td>
                      <td><span className="text-tech-amber">{r.compliance_result?.toUpperCase()}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{new Date(r.generated_at).toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-precision-ghost" onClick={() => navigate(`/reports/${r.id}`)}>
                          <Eye size={12} /> VIEW
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="tech-panel">
          <div className="tech-panel-header">
            <div className="tech-panel-title">AUDIT TIMELINE FOR THIS INSTRUMENT</div>
          </div>
          <div className="tech-panel-body">
            {auditLogs.map(l => (
              <div key={l.id} style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-dim)', minWidth: 140 }}>{new Date(l.timestamp).toLocaleTimeString()}</span>
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{l.action}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{l.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
