import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Settings as SettingsIcon, Building, User, BookOpen, FileText, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '../types';

export default function SettingsPage() {
  const { currentUser, activeRuleVersion, switchUserRole, resetToDefaults } = useAppStore();
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all instrument, test session, and report data back to initial factory demo state?')) {
      resetToDefaults();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings & System Configuration</h2>
        <p>Application parameters, persona controls, and laboratory configuration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Profile */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Persona</div>
            <User size={16} color="var(--purple)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--text-primary)', fontSize: 12, marginBottom: 16 }}>
            <span className="instrument-meta-label">Name</span><span>{currentUser?.full_name}</span>
            <span className="instrument-meta-label">Email</span><span>{currentUser?.email}</span>
            <span className="instrument-meta-label">Current Role</span><span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--purple)' }}>{currentUser?.role}</span>
            <span className="instrument-meta-label">Member Since</span><span>{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : '—'}</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Switch Active Role:</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['operator', 'reviewer', 'auditor', 'admin'] as UserRole[]).map(role => (
                <button
                  key={role}
                  className={`btn btn-sm ${currentUser?.role === role ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                  onClick={() => switchUserRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Testing Organization</div>
            <Building size={16} color="var(--purple)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--text-primary)', fontSize: 12 }}>
            <span className="instrument-meta-label">Organization</span><span>National Metrology Laboratory</span>
            <span className="instrument-meta-label">Category</span><span>Statutory Legal Metrology Facility</span>
            <span className="instrument-meta-label">Jurisdiction</span><span>India</span>
            <span className="instrument-meta-label">Accreditation</span><span>NABL / BIS / OIML Member State</span>
            <span className="instrument-meta-label">Standard</span><span>OIML Recommendation R-76 (Non-Automatic Weighing Instruments)</span>
          </div>
        </div>

        {/* Active Rules */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Metrological Rule Base</div>
            <BookOpen size={16} color="var(--purple)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--text-primary)', fontSize: 12 }}>
            <span className="instrument-meta-label">Standard Set</span><span>{activeRuleVersion.name}</span>
            <span className="instrument-meta-label">Version</span><span>{activeRuleVersion.version}</span>
            <span className="instrument-meta-label">Status</span><span style={{ color: 'var(--pass-green-light)', fontWeight: 600 }}>Active Statutory Rule</span>
            <span className="instrument-meta-label">Required Tests</span><span>{activeRuleVersion.test_procedures.length} procedures</span>
          </div>
        </div>

        {/* Report Templates */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Certificate & Report Templates</div>
            <FileText size={16} color="var(--purple)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Standard OIML R-76 Verification Certificate', code: 'OIML-R76-STD' },
              { name: 'Detailed Calibration & Metrological Test Report', code: 'OIML-R76-DET' },
              { name: 'Subsequent Verification & Retest Certificate', code: 'OIML-R76-RET' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--slate-border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.code}</div>
                </div>
                <span className="status-badge pass">Approved</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Reset & Storage Management */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-title">Laboratory Storage & Demo State</div>
            <RotateCcw size={14} color="var(--steel)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--steel-light)', maxWidth: 600 }}>
              All tests, instrument profiles, configurations, and audit logs persist in your browser's local state. You can reset all records back to the default factory metrology dataset at any time.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {resetDone && (
                <span style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={14} /> Data Reset Complete
                </span>
              )}
              <button className="btn btn-secondary" onClick={handleReset}>
                <RotateCcw size={14} /> Reset to Clean Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-title">System & Architecture Specification</div>
            <SettingsIcon size={14} color="var(--steel)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--off-white)', fontSize: 12 }}>
            <span className="instrument-meta-label">Platform</span><span>METROLOGY — NAWI Testing & Verification Platform</span>
            <span className="instrument-meta-label">Smart India Hackathon</span><span>SIH 2026 · Problem Statement ID: SIH26035</span>
            <span className="instrument-meta-label">International Reference</span><span>OIML R 76-1 (2006E) & OIML R 76-2 (2007E)</span>
            <span className="instrument-meta-label">Frontend Architecture</span><span>React 19, TypeScript, Pure Modern Vanilla CSS Design System</span>
            <span className="instrument-meta-label">Metrological Engine</span><span>Deterministic OIML R-76 Turning Point & MPE Validator</span>
            <span className="instrument-meta-label">Document Pipeline</span><span>Client-side Vector jsPDF Engine with Digital Signature Cryptographic Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
