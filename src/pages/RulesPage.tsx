import React from 'react';
import { useAppStore } from '../lib/store';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { DEFAULT_MPE_TABLE } from '../lib/r76-engine';

export default function RulesPage() {
  const { ruleVersions, activeRuleVersion } = useAppStore();

  return (
    <div>
      <div className="page-header">
        <h2>R-76 Rule Management</h2>
        <p>Configure and manage OIML R-76 rule versions and MPE tables.</p>
      </div>

      {/* Active Rule */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Active Rule Set</div>
          <span className="status-badge pass">Active</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <div className="instrument-meta-item"><span className="instrument-meta-label">Rule Set</span><span className="instrument-meta-value">{activeRuleVersion.name}</span></div>
          <div className="instrument-meta-item"><span className="instrument-meta-label">Version</span><span className="instrument-meta-value mono">{activeRuleVersion.version}</span></div>
          <div className="instrument-meta-item"><span className="instrument-meta-label">Status</span><span className="instrument-meta-value" style={{ textTransform: 'capitalize' }}>{activeRuleVersion.status}</span></div>
          <div className="instrument-meta-item"><span className="instrument-meta-label">Effective Date</span><span className="instrument-meta-value">{new Date(activeRuleVersion.effective_date).toLocaleDateString()}</span></div>
          <div className="instrument-meta-item"><span className="instrument-meta-label">Last Updated</span><span className="instrument-meta-value">{new Date(activeRuleVersion.last_updated).toLocaleDateString()}</span></div>
          <div className="instrument-meta-item"><span className="instrument-meta-label">Updated By</span><span className="instrument-meta-value">{activeRuleVersion.updated_by}</span></div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--steel-light)' }}>{activeRuleVersion.description}</div>
      </div>

      {/* MPE Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Maximum Permissible Errors (MPE)</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--steel-light)', marginBottom: 12 }}>
          Per OIML R-76 Table 3 — Values in multiples of verification scale interval (e).
        </div>
        <table className="data-table" style={{ fontSize: 11 }}>
          <thead>
            <tr><th>Class</th><th>Load Range (n = load/e)</th><th>MPE Initial (±e)</th><th>MPE Subsequent (±e)</th></tr>
          </thead>
          <tbody>
            {DEFAULT_MPE_TABLE.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{row.accuracy_class}</td>
                <td className="mono">{row.load_range_start_n.toLocaleString()} — {row.load_range_end_n === Infinity ? '∞' : row.load_range_end_n.toLocaleString()}</td>
                <td className="mono">±{row.mpe_initial_e}</td>
                <td className="mono">±{row.mpe_subsequent_e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Test Procedures */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Configured Test Procedures</div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Test</th><th>Type</th><th>Mandatory</th><th>Est. Duration</th><th>Description</th></tr>
          </thead>
          <tbody>
            {activeRuleVersion.test_procedures.map((proc, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{proc.name}</td>
                <td className="mono" style={{ fontSize: 11 }}>{proc.test_type}</td>
                <td>{proc.is_mandatory ? <CheckCircle2 size={14} color="var(--green)" /> : '—'}</td>
                <td>{proc.estimated_duration_minutes} min</td>
                <td style={{ fontSize: 11, color: 'var(--steel-light)', maxWidth: 300 }}>{proc.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error Formula */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div className="card-title">Error Calculation Formula</div>
        </div>
        <div style={{ padding: 16, background: 'var(--navy-mid)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--amber)', textAlign: 'center' }}>
          E = I + ½d − ΔL − L
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--steel-light)' }}>
          <p style={{ marginBottom: 4 }}>Where:</p>
          <ul style={{ paddingLeft: 16, lineHeight: 1.8 }}>
            <li><strong>E</strong> — Error of indication</li>
            <li><strong>I</strong> — Indication of the instrument (displayed value)</li>
            <li><strong>d</strong> — Scale interval (resolution)</li>
            <li><strong>ΔL</strong> — Rounding correction (from small additional loads)</li>
            <li><strong>L</strong> — Reference load (true value)</li>
          </ul>
          <p style={{ marginTop: 8 }}>Simplified form for digital instruments (d = e, no rounding correction): <strong>E = I − L</strong></p>
        </div>
      </div>
    </div>
  );
}
