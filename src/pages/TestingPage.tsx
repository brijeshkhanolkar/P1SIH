import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { FlaskConical, ArrowRight, Play } from 'lucide-react';

export default function TestingPage() {
  const navigate = useNavigate();
  const { testSessions, instruments } = useAppStore();
  const active = testSessions.filter(s => s.status === 'in_progress' || s.status === 'paused');
  const completed = testSessions.filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime());

  return (
    <div>
      <div className="page-header">
        <h2>Active Testing</h2>
        <p>Manage ongoing and completed test sessions across all instruments.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">In Progress ({active.length})</div>
        </div>
        {active.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <FlaskConical />
            <h3>No active test sessions</h3>
            <p>Start a test from an instrument's test plan.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Instrument</th><th>Test</th><th>Attempt</th><th>Operator</th><th>Progress</th><th>Started</th><th></th></tr></thead>
            <tbody>
              {active.map(s => {
                const inst = instruments.find(i => i.id === s.instrument_id);
                return (
                  <tr key={s.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{inst?.instrument_id || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{s.test_type}</td>
                    <td>#{s.attempts.length}</td>
                    <td>{s.operator_name}</td>
                    <td style={{ width: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar-fill" style={{ width: `${s.progress}%` }} /></div>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--steel-light)' }}>{s.progress}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>{new Date(s.started_at).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => navigate(`/testing/${s.id}`)}>
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

      <div className="card">
        <div className="card-header">
          <div className="card-title">Completed ({completed.length})</div>
        </div>
        {completed.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <FlaskConical />
            <h3>No completed tests yet</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Instrument</th><th>Test</th><th>Attempts</th><th>Operator</th><th>Result</th><th>Completed</th><th></th></tr></thead>
            <tbody>
              {completed.map(s => {
                const inst = instruments.find(i => i.id === s.instrument_id);
                return (
                  <tr key={s.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{inst?.instrument_id || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{s.test_type}</td>
                    <td>{s.attempts.length}</td>
                    <td>{s.operator_name}</td>
                    <td><span className={`status-badge ${s.result}`}>{s.result}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>{new Date(s.completed_at || '').toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/instruments/${s.instrument_id}`)}>
                        View <ArrowRight size={11} />
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
  );
}
