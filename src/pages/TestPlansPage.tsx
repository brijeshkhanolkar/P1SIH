import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ClipboardList, ArrowRight, Play } from 'lucide-react';

export default function TestPlansPage() {
  const navigate = useNavigate();
  const { testPlans, instruments } = useAppStore();

  return (
    <div>
      <div className="page-header">
        <h2>Test Plans</h2>
        <p>Generated test plans for instrument evaluations.</p>
      </div>

      <div className="card">
        {testPlans.length === 0 ? (
          <div className="empty-state">
            <ClipboardList />
            <h3>No test plans generated</h3>
            <p>Configure an instrument and generate a test plan to begin.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Instrument</th><th>Tests</th><th>Status</th><th>Rule Version</th><th>Generated</th><th></th></tr>
            </thead>
            <tbody>
              {testPlans.map(plan => {
                const inst = instruments.find(i => i.id === plan.instrument_id);
                const passed = plan.tests.filter(t => t.status === 'pass').length;
                const failed = plan.tests.filter(t => t.status === 'fail').length;
                const total = plan.tests.length;
                return (
                  <tr key={plan.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{inst?.instrument_id || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {plan.tests.map((t, i) => (
                          <span key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: t.status === 'pass' ? 'var(--green)' : t.status === 'fail' ? 'var(--red)' : t.status === 'in_progress' ? 'var(--amber)' : 'var(--charcoal-light)',
                          }} title={`${t.name}: ${t.status}`} />
                        ))}
                        <span style={{ fontSize: 11, color: 'var(--steel-light)', marginLeft: 4 }}>
                          {passed}/{total}
                        </span>
                      </div>
                    </td>
                    <td><span className={`status-badge ${plan.status}`}>{plan.status}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>{plan.rule_version_id}</td>
                    <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>{new Date(plan.generated_at).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/instruments/${plan.instrument_id}`)}>
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
