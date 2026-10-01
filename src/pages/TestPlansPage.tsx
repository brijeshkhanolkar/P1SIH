import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ClipboardList, ArrowRight, Play, Scale, CheckCircle2, Clock } from 'lucide-react';

export default function TestPlansPage() {
  const navigate = useNavigate();
  const { testPlans, instruments, setQuickTestOpen, startTestingForInstrument } = useAppStore();

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClipboardList size={14} /> STATUTORY TEST PROTOCOLS
          </div>
          <h1 className="page-hero-title">
            OIML R-76 Test Plans
          </h1>
          <p className="page-hero-subtitle">
            Pre-computed test loads and sequencing tailored to each instrument's accuracy class, maximum capacity ($Max$), and scale intervals ($e$).
          </p>
        </div>

        <button
          className="btn-precision-amber"
          onClick={() => setQuickTestOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Play size={14} fill="currentColor" /> START A TEST
        </button>
      </div>

      <div className="tech-table-container">
        {testPlans.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>NO TEST PLANS GENERATED</div>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Test plans are automatically created when you begin verification on an instrument.</p>
          </div>
        ) : (
          <table className="tech-table">
            <thead>
              <tr>
                <th>SCALE IDENTIFIER</th>
                <th>MANUFACTURER & MODEL</th>
                <th>CLASS</th>
                <th>TESTS COMPLETED</th>
                <th>STATUS</th>
                <th>RULE SET</th>
                <th>GENERATED DATE</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {testPlans.map(plan => {
                const inst = instruments.find(i => i.id === plan.instrument_id);
                const passed = plan.tests.filter(t => t.status === 'pass').length;
                const total = plan.tests.length;

                return (
                  <tr key={plan.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {inst?.serial_number || inst?.instrument_id || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inst?.manufacturer} {inst?.model}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {inst?.instrument_type}
                      </div>
                    </td>
                    <td>
                      {inst?.accuracy_class && (
                        <span className={`badge-class-${inst.accuracy_class.toLowerCase()}`}>
                          CLASS {inst.accuracy_class}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {plan.tests.map((t, i) => (
                          <span
                            key={i}
                            style={{
                              width: 9, height: 9, borderRadius: '50%',
                              background: t.status === 'pass' ? 'var(--pass-green)' : t.status === 'fail' ? 'var(--fail-red)' : t.status === 'in_progress' ? 'var(--amber)' : 'rgba(255,255,255,0.15)',
                            }}
                            title={`${t.name}: ${t.status}`}
                          />
                        ))}
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginLeft: 6 }}>
                          {passed}/{total} Passed
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge compliant" style={{ textTransform: 'uppercase', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                        {plan.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      OIML R-76:2006
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(plan.generated_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn-precision-amber"
                          onClick={() => {
                            if (inst) {
                              const sid = startTestingForInstrument(inst.id, 'accuracy');
                              navigate(`/testing/${sid}`);
                            }
                          }}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Play size={11} fill="currentColor" /> TEST
                        </button>
                        <button
                          className="btn-precision-ghost"
                          onClick={() => navigate(`/instruments/${plan.instrument_id}`)}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem' }}
                        >
                          PROFILE
                        </button>
                      </div>
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
