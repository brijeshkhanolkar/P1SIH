import React from 'react';
import { useAppStore } from '../lib/store';
import { BookOpen, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';
import { DEFAULT_MPE_TABLE } from '../lib/r76-engine';

export default function RulesPage() {
  const { activeRuleVersion } = useAppStore();

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Hero */}
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={14} /> OIML R-76 REGULATORY ENGINE
          </div>
          <h1 className="page-hero-title">
            OIML R-76 Statutory Rule Engine
          </h1>
          <p className="page-hero-subtitle">
            International legal metrology tolerance tables, statutory MPE thresholds, and verification test formulas per OIML Recommendation R 76-1 (Edition 2006 E).
          </p>
        </div>
      </div>

      {/* Active Rule Set Panel */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <div className="tech-panel-title">
            <ShieldCheck size={16} color="var(--pass-green)" />
            ACTIVE REGULATORY RULE SPECIFICATION
          </div>
          <span style={{
            fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: 'var(--pass-green-light)', background: 'var(--pass-green-dim)',
            padding: '2px 8px', borderRadius: 3, border: '1px solid var(--pass-green-border)'
          }}>
            ENFORCED SYSTEM-WIDE
          </span>
        </div>

        <div className="tech-panel-body" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 4, border: '1px solid var(--slate-border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RULE NAME</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{activeRuleVersion.name}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 4, border: '1px solid var(--slate-border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>VERSION IDENTIFIER</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{activeRuleVersion.version}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 4, border: '1px solid var(--slate-border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EFFECTIVE DATE</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{new Date(activeRuleVersion.effective_date).toLocaleDateString()}</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 4, border: '1px solid var(--slate-border)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ENFORCEMENT AUTHORITY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{activeRuleVersion.updated_by}</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {activeRuleVersion.description}
          </p>
        </div>
      </div>

      {/* MPE Tolerance Table */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <div className="tech-panel-title">
            <Scale size={16} color="var(--amber)" />
            MAXIMUM PERMISSIBLE ERROR (MPE) THRESHOLDS · TABLE 3
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            VALUES EXPRESSED IN INTERVALS (e)
          </span>
        </div>

        <div className="tech-panel-body" style={{ padding: 0 }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>ACCURACY CLASS</th>
                <th>LOAD RANGE (n = Load / e)</th>
                <th>MPE INITIAL VERIFICATION</th>
                <th>MPE IN-SERVICE INSPECTION</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_MPE_TABLE.map((row, i) => (
                <tr key={i}>
                  <td>
                    <span className={`badge-class-${row.accuracy_class.toLowerCase()}`}>
                      CLASS {row.accuracy_class}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {row.load_range_start_n.toLocaleString()} e &nbsp;—&nbsp; {row.load_range_end_n === Infinity ? '∞' : `${row.load_range_end_n.toLocaleString()} e`}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--pass-green-light)', fontSize: '0.85rem' }}>
                    ± {row.mpe_initial_e} e
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-light)', fontSize: '0.85rem' }}>
                    ± {row.mpe_subsequent_e} e
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mathematical Formulation */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <div className="tech-panel-title">
            <BookOpen size={16} color="var(--info-blue-light)" />
            STATUTORY ERROR CALCULATION & TURNING POINT FORMULA
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            OIML R-76 §A.4.4.3
          </span>
        </div>

        <div className="tech-panel-body" style={{ padding: '1.25rem' }}>
          <div style={{
            padding: '1rem',
            background: 'var(--bg-void)',
            borderRadius: 6,
            border: '1px solid var(--slate-border-light)',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--amber)',
            textAlign: 'center',
            letterSpacing: '0.04em'
          }}>
            E = I + ½·e − ΔL − L
          </div>

          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div><strong>E:</strong> True Error of Indication</div>
            <div><strong>I:</strong> Indicated value on scale display</div>
            <div><strong>e:</strong> Verification scale interval</div>
            <div><strong>ΔL:</strong> Turning point added weight</div>
            <div><strong>L:</strong> Standard calibrated test load applied</div>
          </div>
        </div>
      </div>
    </div>
  );
}
