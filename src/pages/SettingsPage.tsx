import React from 'react';
import { useAppStore } from '../lib/store';
import { Settings as SettingsIcon, Building, User, BookOpen, FileText, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, activeRuleVersion } = useAppStore();

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Application configuration, profile and system settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Profile */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Profile</div>
            <User size={14} color="var(--steel)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--off-white)', fontSize: 12 }}>
            <span className="instrument-meta-label">Name</span><span>{currentUser?.full_name}</span>
            <span className="instrument-meta-label">Email</span><span>{currentUser?.email}</span>
            <span className="instrument-meta-label">Role</span><span style={{ textTransform: 'capitalize' }}>{currentUser?.role}</span>
            <span className="instrument-meta-label">Member Since</span><span>{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : '—'}</span>
          </div>
        </div>

        {/* Organization */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Organization</div>
            <Building size={14} color="var(--steel)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--off-white)', fontSize: 12 }}>
            <span className="instrument-meta-label">Name</span><span>National Metrology Laboratory</span>
            <span className="instrument-meta-label">Type</span><span>Government Testing Facility</span>
            <span className="instrument-meta-label">Country</span><span>India</span>
            <span className="instrument-meta-label">Accreditation</span><span>NABL / BIS</span>
          </div>
        </div>

        {/* Active Rules */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Rule Version</div>
            <BookOpen size={14} color="var(--steel)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--off-white)', fontSize: 12 }}>
            <span className="instrument-meta-label">Rule</span><span>{activeRuleVersion.name}</span>
            <span className="instrument-meta-label">Version</span><span>{activeRuleVersion.version}</span>
            <span className="instrument-meta-label">Status</span><span style={{ color: 'var(--green)' }}>Active</span>
            <span className="instrument-meta-label">Tests</span><span>{activeRuleVersion.test_procedures.length} procedures</span>
          </div>
        </div>

        {/* Report Templates */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Report Templates</div>
            <FileText size={14} color="var(--steel)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Standard Test Report', 'Detailed Test Report', 'Retest Report'].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 12 }}>{t}</span>
                <span className="status-badge pass">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* System */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-title">System Information</div>
            <SettingsIcon size={14} color="var(--steel)" />
          </div>
          <div className="report-info-grid" style={{ color: 'var(--off-white)', fontSize: 12 }}>
            <span className="instrument-meta-label">Platform</span><span>METROLOGY NAWI Testing Platform</span>
            <span className="instrument-meta-label">Version</span><span>1.0.0-SIH2026</span>
            <span className="instrument-meta-label">Problem Statement</span><span>SIH26035 — NAWI Test Report Generation per OIML R-76</span>
            <span className="instrument-meta-label">Framework</span><span>React + TypeScript + Zustand</span>
            <span className="instrument-meta-label">Database</span><span>Supabase (PostgreSQL) — Demo Mode: LocalStorage</span>
            <span className="instrument-meta-label">Compliance Standard</span><span>OIML Recommendation R-76</span>
          </div>
        </div>
      </div>
    </div>
  );
}
