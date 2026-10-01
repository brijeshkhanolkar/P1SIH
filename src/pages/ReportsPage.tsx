import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  FileText, Eye, Search, ShieldCheck, CheckCircle2,
  XCircle, Clock, Download, ArrowRight
} from 'lucide-react';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { reports } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterCompliance, setFilterCompliance] = useState('');

  const approvedCount = reports.filter(r => r.approval_status === 'approved').length;
  const passedCount = reports.filter(r => r.compliance_result === 'pass').length;

  const filtered = reports.filter(r => {
    const matchesSearch = !search || [r.report_number, r.instrument.instrument_id, r.instrument.manufacturer, r.instrument.model]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchesCompliance = !filterCompliance || r.compliance_result === filterCompliance;
    return matchesSearch && matchesCompliance;
  });

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Hero */}
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> OIML R 76-2 STATUTORY CERTIFICATES
          </div>
          <h1 className="page-hero-title">
            Official Metrological Test Certificates
          </h1>
          <p className="page-hero-subtitle">
            Format strictly compliant with OIML R 76-2 Part 2 (Pattern Evaluation & Verification Report). Complete with digital signatures and instant print-ready vector PDF generation.
          </p>
        </div>
      </div>

      {/* Summary Stat Shelf */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
          <FileText size={15} color="var(--steel-light)" />
          <span style={{ color: 'var(--text-secondary)' }}>Total Certificates:</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{reports.length}</span>
        </div>

        <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
          <CheckCircle2 size={15} color="var(--pass-green)" />
          <span style={{ color: 'var(--text-secondary)' }}>Compliant (Within MPE):</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--pass-green-light)' }}>{passedCount}</span>
        </div>

        <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
          <ShieldCheck size={15} color="var(--amber)" />
          <span style={{ color: 'var(--text-secondary)' }}>Reviewer Signed & Approved:</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--amber-light)' }}>{approvedCount}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-shelf">
        <div className="search-box-precision">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search certificates by report number, scale ID, or manufacturer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={filterCompliance}
          onChange={e => setFilterCompliance(e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
        >
          <option value="">ALL COMPLIANCE RESULTS</option>
          <option value="pass">PASS (WITHIN STATUTORY MPE)</option>
          <option value="fail">FAIL (EXCEEDS MPE)</option>
        </select>
      </div>

      {/* Certificates Table */}
      <div className="tech-table-container">
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>NO CERTIFICATES GENERATED</div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.35rem' }}>
              Complete an instrument test sequence to generate an official OIML test certificate.
            </div>
          </div>
        ) : (
          <table className="tech-table">
            <thead>
              <tr>
                <th>REPORT NUMBER</th>
                <th>WEIGHING SCALE</th>
                <th>ACCURACY CLASS</th>
                <th>VERDICT</th>
                <th>LEGAL VERIFICATION</th>
                <th>ISSUED TO / OPERATOR</th>
                <th>DATE ISSUED</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/reports/${r.id}`)}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {r.report_number}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      OIML R-76-2 FORMAT
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.instrument.manufacturer} {r.instrument.model}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      {r.instrument.serial_number || r.instrument.instrument_id}
                    </div>
                  </td>

                  <td>
                    <span className={`badge-class-${r.instrument.accuracy_class.toLowerCase()}`}>
                      CLASS {r.instrument.accuracy_class}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                      color: r.compliance_result === 'pass' ? 'var(--pass-green-light)' : 'var(--fail-red-light)',
                      background: r.compliance_result === 'pass' ? 'var(--pass-green-dim)' : 'var(--fail-red-dim)',
                      padding: '0.15rem 0.5rem', borderRadius: 3,
                      border: `1px solid ${r.compliance_result === 'pass' ? 'var(--pass-green-border)' : 'var(--fail-red-border)'}`
                    }}>
                      {r.compliance_result === 'pass' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {r.compliance_result.toUpperCase()}
                    </span>
                  </td>

                  <td>
                    {r.approval_status === 'approved' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                        color: 'var(--pass-green-light)', background: 'var(--pass-green-dim)',
                        padding: '0.15rem 0.5rem', borderRadius: 3, border: '1px solid var(--pass-green-border)'
                      }}>
                        <ShieldCheck size={12} /> APPROVED
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                        color: 'var(--amber-light)', background: 'var(--amber-dim)',
                        padding: '0.15rem 0.5rem', borderRadius: 3, border: '1px solid var(--amber-border)'
                      }}>
                        <Clock size={12} /> PENDING SIGN-OFF
                      </span>
                    )}
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{r.generated_by_name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{r.instrument.owner_organization}</div>
                  </td>

                  <td style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(r.generated_at).toLocaleDateString()}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="btn-precision-amber"
                        onClick={(e) => { e.stopPropagation(); navigate(`/reports/${r.id}`); }}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={12} /> INSPECT & PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
