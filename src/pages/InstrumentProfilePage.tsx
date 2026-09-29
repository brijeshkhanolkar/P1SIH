import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { generateTestLoads, getEccentricityLoad } from '../lib/r76-engine';
import {
  Scale, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Clock,
  Play, FileText, Upload, Eye, RotateCcw, Settings, ChevronRight,
  Check, X as XIcon, Download
} from 'lucide-react';

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
      <div className="empty-state" style={{ height: '50vh' }}>
        <Scale />
        <h3>Instrument not found</h3>
        <p>The requested instrument does not exist.</p>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/instruments')}>
          <ArrowLeft size={14} /> Back to Instruments
        </button>
      </div>
    );
  }

  const handleConfigure = () => {
    if (!instrument) return;
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
    if (!instrument) return;
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
    if (!instrument) return;
    const report = store.generateReport(instrument.id, 'standard');
    navigate(`/reports/${report.id}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !instrument) return;
    Array.from(files).forEach(file => {
      store.addEvidence({
        instrument_id: instrument.id,
        file_name: file.name,
        file_type: file.type || 'unknown',
        file_size: file.size,
        file_url: URL.createObjectURL(file),
        uploaded_by: store.currentUser?.id || 'user-002',
        uploaded_by_name: store.currentUser?.full_name || 'Operator',
      });
    });
    e.target.value = '';
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass': case 'compliant': return <CheckCircle2 size={14} color="var(--green)" />;
      case 'fail': case 'non_compliant': return <XCircle size={14} color="var(--red)" />;
      case 'in_progress': case 'under_test': return <Clock size={14} color="var(--amber)" />;
      default: return <AlertTriangle size={14} color="var(--steel)" />;
    }
  };

  // Config validation
  const configChecks = config ? [
    { label: 'Accuracy class configured', valid: !!config.accuracy_class },
    { label: 'Maximum capacity configured', valid: config.max_capacity > 0 },
    { label: 'Verification interval configured', valid: config.verification_interval > 0 },
    { label: 'Number of verification intervals calculated', valid: config.num_verification_intervals >= 100 },
    { label: 'Minimum capacity configured', valid: config.min_capacity >= 0 },
    { label: 'Applicable R-76 rule set identified', valid: !!config.rule_version_id },
  ] : [];

  const testLoads = config ? generateTestLoads(config.max_capacity, config.min_capacity, config.verification_interval, config.accuracy_class) : [];

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('/instruments')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={14} /> Back to Instruments
      </button>

      {/* Instrument Header */}
      <div className="instrument-header animate-in">
        <div className="instrument-icon">
          <Scale />
        </div>
        <div className="instrument-details">
          <h2>
            {instrument.instrument_id}
            <span className={`status-badge ${instrument.status.replace('_', '-')}`}>
              {instrument.status.replace('_', ' ')}
            </span>
          </h2>
          <div style={{ fontSize: 12, color: 'var(--steel-light)', marginTop: 2 }}>
            {instrument.manufacturer} {instrument.model} — {instrument.serial_number}
          </div>
          <div className="instrument-meta">
            <div className="instrument-meta-item"><span className="instrument-meta-label">Class</span><span className="instrument-meta-value">{instrument.accuracy_class}</span></div>
            <div className="instrument-meta-item"><span className="instrument-meta-label">Max</span><span className="instrument-meta-value mono">{instrument.max_capacity} {instrument.unit}</span></div>
            <div className="instrument-meta-item"><span className="instrument-meta-label">e</span><span className="instrument-meta-value mono">{instrument.verification_interval} {instrument.unit}</span></div>
            <div className="instrument-meta-item"><span className="instrument-meta-label">n</span><span className="instrument-meta-value mono">{instrument.num_verification_intervals.toLocaleString()}</span></div>
            <div className="instrument-meta-item"><span className="instrument-meta-label">Min</span><span className="instrument-meta-value mono">{instrument.min_capacity} {instrument.unit}</span></div>
            <div className="instrument-meta-item"><span className="instrument-meta-label">Location</span><span className="instrument-meta-value">{instrument.location}</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {!config && <button className="btn btn-secondary" onClick={handleConfigure}><Settings size={14} /> Configure</button>}
          {config && !testPlan && <button className="btn btn-primary" onClick={handleGenerateTestPlan}><Play size={14} /> Generate Test Plan</button>}
          {sessions.some(s => s.status === 'completed') && <button className="btn btn-secondary" onClick={handleGenerateReport}><FileText size={14} /> Generate Report</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['overview', 'config', 'plan', 'history', 'evidence', 'reports', 'audit'] as const).map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'config' ? 'Configuration' : tab === 'plan' ? 'Test Plan' : tab === 'history' ? 'Test History' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="animate-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Instrument Information</div>
              <div className="report-info-grid" style={{ color: 'var(--off-white)', fontSize: 12 }}>
                <span className="instrument-meta-label">Type</span><span>{instrument.instrument_type}</span>
                <span className="instrument-meta-label">Manufacturer</span><span>{instrument.manufacturer}</span>
                <span className="instrument-meta-label">Model</span><span>{instrument.model}</span>
                <span className="instrument-meta-label">Serial</span><span style={{ fontFamily: 'var(--font-mono)' }}>{instrument.serial_number}</span>
                <span className="instrument-meta-label">Owner</span><span>{instrument.owner_organization}</span>
                <span className="instrument-meta-label">Received</span><span>{new Date(instrument.date_received).toLocaleDateString()}</span>
                {instrument.manufacturer_details && <>
                  <span className="instrument-meta-label">Mfr. Details</span><span>{instrument.manufacturer_details}</span>
                </>}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Test Summary</div>
              {sessions.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--steel-light)' }}>No tests performed yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sessions.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {statusIcon(s.result || s.status)}
                        <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{s.test_type} Test</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.attempts.length > 1 && <span style={{ fontSize: 10, color: 'var(--yellow)' }}>{s.attempts.length} attempts</span>}
                        <span className={`status-badge ${(s.result || s.status).replace('_', '-')}`}>
                          {(s.result || s.status).replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="animate-in">
          {config ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Configuration Parameters</div>
                <div className="report-info-grid" style={{ color: 'var(--off-white)', fontSize: 12 }}>
                  <span className="instrument-meta-label">Accuracy Class</span><span>{config.accuracy_class}</span>
                  <span className="instrument-meta-label">Max Capacity</span><span style={{ fontFamily: 'var(--font-mono)' }}>{config.max_capacity} {config.unit}</span>
                  <span className="instrument-meta-label">Verification Interval (e)</span><span style={{ fontFamily: 'var(--font-mono)' }}>{config.verification_interval} {config.unit}</span>
                  <span className="instrument-meta-label">n (Max ÷ e)</span><span style={{ fontFamily: 'var(--font-mono)' }}>{config.num_verification_intervals.toLocaleString()}</span>
                  <span className="instrument-meta-label">Min Capacity</span><span style={{ fontFamily: 'var(--font-mono)' }}>{config.min_capacity} {config.unit}</span>
                  <span className="instrument-meta-label">Rule Version</span><span>{store.activeRuleVersion.name}</span>
                  <span className="instrument-meta-label">Configured By</span><span>{store.users.find(u => u.id === config.configured_by)?.full_name || config.configured_by}</span>
                  <span className="instrument-meta-label">Configured At</span><span>{new Date(config.configured_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Configuration Validation</div>
                <div className="validation-list">
                  {configChecks.map((check, i) => (
                    <div key={i} className={`validation-item ${check.valid ? 'valid' : 'invalid'}`}>
                      {check.valid ? <Check size={14} /> : <XIcon size={14} />}
                      {check.label}
                    </div>
                  ))}
                </div>
                {configChecks.every(c => c.valid) && !testPlan && (
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleGenerateTestPlan}>
                    <Play size={14} /> Generate Test Plan
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <Settings />
                <h3>Configuration Required</h3>
                <p>Configure the instrument parameters before generating a test plan.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleConfigure}>
                  <Settings size={14} /> Configure Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="animate-in">
          {testPlan ? (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title-lg">Test Plan</div>
                  <div style={{ fontSize: 11, color: 'var(--steel-light)', marginTop: 2 }}>
                    Instrument: {instrument.instrument_id} · Rule Version: {store.activeRuleVersion.name} · Generated: {new Date(testPlan.generated_at).toLocaleString()}
                  </div>
                </div>
                <span className={`status-badge ${testPlan.status}`}>{testPlan.status}</span>
              </div>

              <div className="test-progress-steps">
                {testPlan.tests.map((test, i) => {
                  const session = sessions.find(s => s.test_type === test.test_type);
                  const stepClass = test.status === 'pass' ? 'complete' : test.status === 'fail' ? 'fail' : test.status === 'in_progress' ? 'active' : 'pending';
                  return (
                    <div key={i} className={`test-step ${stepClass}`}>
                      <div className={`test-step-indicator ${stepClass}`}>
                        {test.status === 'pass' ? <Check size={12} /> :
                         test.status === 'fail' ? <XIcon size={10} /> :
                         String(test.sequence).padStart(2, '0')}
                      </div>
                      <div className="test-step-content">
                        <div className="test-step-name">{test.name}</div>
                        <div className="test-step-meta">
                          {test.estimated_duration_minutes} min · {test.required_measurements} measurements · {test.is_mandatory ? 'Mandatory' : 'Optional'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {test.status !== 'pending' && (
                          <span className={`status-badge ${test.status.replace('_', '-')}`}>{test.status.replace('_', ' ')}</span>
                        )}
                        {(test.status === 'pending' || test.status === 'fail') && (
                          <button className="btn btn-sm btn-primary" onClick={() => handleStartTest(test.test_type)}>
                            {test.status === 'fail' ? <><RotateCcw size={11} /> Retest</> : <><Play size={11} /> Start</>}
                          </button>
                        )}
                        {test.status === 'in_progress' && session && (
                          <button className="btn btn-sm btn-primary" onClick={() => navigate(`/testing/${session.id}`)}>
                            Continue <ChevronRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <Clock />
                <h3>No Test Plan Generated</h3>
                <p>{config ? 'Generate a test plan to begin testing.' : 'Configure the instrument first.'}</p>
                {config ? (
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleGenerateTestPlan}>
                    <Play size={14} /> Generate Test Plan
                  </button>
                ) : (
                  <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={handleConfigure}>
                    <Settings size={14} /> Configure First
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in">
          {sessions.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <Clock />
                <h3>No test history</h3>
                <p>Test sessions will appear here after testing begins.</p>
              </div>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="card" style={{ marginBottom: 12 }}>
                <div className="card-header">
                  <div>
                    <div className="card-title-lg" style={{ textTransform: 'capitalize' }}>{session.test_type} Test</div>
                    <div style={{ fontSize: 11, color: 'var(--steel-light)' }}>
                      Started: {new Date(session.started_at).toLocaleString()} · Operator: {session.operator_name}
                    </div>
                  </div>
                  <span className={`status-badge ${(session.result || session.status).replace('_', '-')}`}>
                    {(session.result || session.status).replace('_', ' ')}
                  </span>
                </div>
                {session.attempts.map(attempt => (
                  <div key={attempt.id} style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <span style={{ fontWeight: 600 }}>Attempt {attempt.attempt_number}</span>
                        <span className={`status-badge ${attempt.result.replace('_', '-')}`}>{attempt.result.replace('_', ' ')}</span>
                        {attempt.reason && <span style={{ color: 'var(--steel-light)', fontSize: 11 }}>— {attempt.reason}</span>}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--steel)' }}>{new Date(attempt.started_at).toLocaleTimeString()}</span>
                    </div>
                    {attempt.measurements.length > 0 && (
                      <table className="data-table" style={{ fontSize: 11 }}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Reference</th>
                            <th>Indicated</th>
                            {session.test_type === 'eccentricity' && <th>Position</th>}
                            <th>Error</th>
                            <th>MPE</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attempt.measurements.map(m => (
                            <tr key={m.id}>
                              <td>{m.measurement_number}</td>
                              <td className="mono">{m.reference_load} {m.unit}</td>
                              <td className="mono">{m.indicated_value} {m.unit}</td>
                              {session.test_type === 'eccentricity' && <td style={{ textTransform: 'capitalize' }}>{m.position?.replace('-', ' ')}</td>}
                              <td className="mono" style={{ color: m.result === 'pass' ? 'var(--green)' : 'var(--red)' }}>
                                {m.error >= 0 ? '+' : ''}{m.error.toFixed(4)}
                              </td>
                              <td className="mono">±{m.mpe.toFixed(4)}</td>
                              <td><span className={`status-badge ${m.result}`}>{m.result}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="animate-in">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Evidence & Attachments</div>
              <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={12} /> Upload
                <input type="file" multiple hidden onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
              </label>
            </div>
            {evidence.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <Upload />
                <h3>No evidence uploaded</h3>
                <p>Upload photos, documents, or test evidence.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>File</th><th>Type</th><th>Size</th><th>Uploaded By</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {evidence.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 500 }}>{e.file_name}</td>
                      <td style={{ fontSize: 11 }}>{e.file_type}</td>
                      <td style={{ fontSize: 11 }}>{(e.file_size / 1024).toFixed(1)} KB</td>
                      <td>{e.uploaded_by_name}</td>
                      <td style={{ fontSize: 11 }}>{new Date(e.uploaded_at).toLocaleString()}</td>
                      <td>
                        {e.file_url && (
                          <button className="btn btn-sm btn-ghost" onClick={() => window.open(e.file_url, '_blank')}>
                            <Eye size={12} /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="animate-in">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Generated Reports</div>
              {sessions.some(s => s.status === 'completed') && (
                <button className="btn btn-sm btn-primary" onClick={handleGenerateReport}>
                  <FileText size={12} /> Generate New Report
                </button>
              )}
            </div>
            {reports.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <FileText />
                <h3>No reports generated</h3>
                <p>Complete tests and generate a report.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Report #</th><th>Type</th><th>Result</th><th>Generated By</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/reports/${r.id}`)}>
                      <td className="mono" style={{ fontWeight: 600 }}>{r.report_number}</td>
                      <td style={{ textTransform: 'capitalize' }}>{r.report_type}</td>
                      <td><span className={`status-badge ${r.compliance_result}`}>{r.compliance_result}</span></td>
                      <td>{r.generated_by_name}</td>
                      <td style={{ fontSize: 11 }}>{new Date(r.generated_at).toLocaleString()}</td>
                      <td><button className="btn btn-sm btn-ghost"><Eye size={12} /> View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="animate-in">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Audit Log</div>
            <div className="audit-timeline">
              {auditLogs.slice(0, 20).map(log => (
                <div key={log.id} className={`audit-entry ${log.user_id === 'system' ? 'system' : 'user'}`}>
                  <div className="audit-timestamp">{new Date(log.timestamp).toLocaleString()}</div>
                  <div className="audit-actor">{log.user_name}</div>
                  <div className="audit-action">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
