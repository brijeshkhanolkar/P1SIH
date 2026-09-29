import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  Scale, FlaskConical, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, Clock, Plus, FileText, RotateCcw
} from 'lucide-react';
import InstrumentRegistrationModal from '../components/InstrumentRegistrationModal';

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased * 10) / 10);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <>{Number.isInteger(value) ? Math.round(display) : display.toFixed(1)}{suffix}</>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardMetrics: m, testSessions, instruments, recalculateMetrics } = useAppStore();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => { recalculateMetrics(); }, []);

  const activeSessions = testSessions.filter(s => s.status === 'in_progress');
  const recentCompleted = testSessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
    .slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Testing Overview</h2>
            <p>Monitor laboratory instrument evaluations, active tests, and metrological compliance.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
              <FileText size={14} /> View Reports
            </button>
            <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
              <Plus size={14} /> Register Instrument
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-panel animate-in">
          <div className="metric-label">Registered Instruments</div>
          <div className="metric-value"><AnimatedNumber value={m.registered_instruments} /></div>
          <div className="metric-change positive">+{m.instruments_change} this month</div>
        </div>
        <div className="metric-panel animate-in animate-in-delay-1">
          <div className="metric-label">Active Tests</div>
          <div className="metric-value"><AnimatedNumber value={m.active_tests} /></div>
          <div className={`metric-change ${m.tests_requiring_attention > 0 ? 'warning' : ''}`}>
            {m.tests_requiring_attention > 0 ? `${m.tests_requiring_attention} require attention` : 'All on track'}
          </div>
        </div>
        <div className="metric-panel animate-in animate-in-delay-2">
          <div className="metric-label">Tests This Month</div>
          <div className="metric-value"><AnimatedNumber value={m.tests_this_month} /></div>
          <div className="metric-change">{m.pending_tests} pending</div>
        </div>
        <div className="metric-panel animate-in animate-in-delay-3">
          <div className="metric-label">Compliance Rate</div>
          <div className="metric-value"><AnimatedNumber value={m.compliance_percentage} suffix="%" /></div>
          <div className="metric-change">Based on completed evaluations</div>
        </div>
        <div className="metric-panel animate-in animate-in-delay-4">
          <div className="metric-label">Passed</div>
          <div className="metric-value" style={{ color: 'var(--green)' }}><AnimatedNumber value={m.passed_tests} /></div>
          <div className="metric-change positive">
            <CheckCircle2 size={11} style={{ marginRight: 3 }} />
            Within MPE
          </div>
        </div>
        <div className="metric-panel animate-in animate-in-delay-4">
          <div className="metric-label">Failed</div>
          <div className="metric-value" style={{ color: 'var(--red)' }}><AnimatedNumber value={m.failed_tests} /></div>
          <div className="metric-change negative">
            <XCircle size={11} style={{ marginRight: 3 }} />
            Exceeded MPE
          </div>
        </div>
      </div>

      {/* Active Test Sessions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Active Test Sessions</div>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/testing')}>
            View All <ArrowRight size={12} />
          </button>
        </div>
        {activeSessions.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <FlaskConical />
            <h3>No active test sessions</h3>
            <p>Start a new test from the Instruments page or test plan.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Test</th>
                <th>Operator</th>
                <th>Progress</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map(session => {
                const inst = instruments.find(i => i.id === session.instrument_id);
                return (
                  <tr key={session.id}>
                    <td className="mono">{inst?.instrument_id || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{session.test_type}</td>
                    <td>{session.operator_name}</td>
                    <td style={{ width: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-bar-fill" style={{ width: `${session.progress}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--steel-light)', fontFamily: 'var(--font-mono)' }}>
                          {session.progress}%
                        </span>
                      </div>
                    </td>
                    <td><span className="status-badge in-progress">In Progress</span></td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/testing/${session.id}`)}
                      >
                        Continue <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Test Results */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Test Results</div>
        </div>
        {recentCompleted.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <Clock />
            <h3>No completed tests yet</h3>
            <p>Results will appear here after tests are completed.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Class</th>
                <th>Test</th>
                <th>Attempts</th>
                <th>Result</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentCompleted.map(session => {
                const inst = instruments.find(i => i.id === session.instrument_id);
                return (
                  <tr key={session.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/instruments/${session.instrument_id}`)}>
                    <td className="mono">{inst?.instrument_id || '—'}</td>
                    <td>{inst?.accuracy_class || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{session.test_type}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                        {session.attempts.length > 1 && <RotateCcw size={11} color="var(--yellow)" />}
                        {session.attempts.length}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${session.result}`}>
                        {session.result === 'pass' ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>
                      {session.completed_at ? new Date(session.completed_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showRegister && <InstrumentRegistrationModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
