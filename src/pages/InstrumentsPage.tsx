import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  Plus, Search, Scale, Filter, ChevronDown, ArrowRight,
  Play, Eye, History, Sparkles, CheckCircle2, AlertTriangle,
  Clock, ShieldCheck
} from 'lucide-react';
import InstrumentRegistrationModal from '../components/InstrumentRegistrationModal';

export default function InstrumentsPage() {
  const navigate = useNavigate();
  const { instruments, testSessions, setQuickTestOpen, startTestingForInstrument } = useAppStore();
  const [showRegister, setShowRegister] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const compliantCount = instruments.filter(i => i.status === 'compliant').length;
  const underTestCount = instruments.filter(i => i.status === 'under_test').length;
  const nonCompliantCount = instruments.filter(i => i.status === 'non_compliant').length;

  const filtered = useMemo(() => {
    return instruments.filter(i => {
      const matchSearch = !search || [i.instrument_id, i.manufacturer, i.model, i.serial_number, i.location]
        .some(f => f?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = !statusFilter || i.status === statusFilter;
      const matchClass = !classFilter || i.accuracy_class === classFilter;
      return matchSearch && matchStatus && matchClass;
    });
  }, [instruments, search, statusFilter, classFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('compliant') && !s.includes('non')) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem', fontWeight: 700, color: 'var(--pass-green-light)',
          background: 'var(--pass-green-dim)', padding: '0.2rem 0.55rem', borderRadius: 3,
          border: '1px solid var(--pass-green-border)'
        }}>
          <CheckCircle2 size={11} /> COMPLIANT
        </span>
      );
    }
    if (s.includes('non_compliant') || s.includes('fail')) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem', fontWeight: 700, color: 'var(--fail-red-light)',
          background: 'var(--fail-red-dim)', padding: '0.2rem 0.55rem', borderRadius: 3,
          border: '1px solid var(--fail-red-border)'
        }}>
          <AlertTriangle size={11} /> NON-COMPLIANT
        </span>
      );
    }
    if (s.includes('test') || s.includes('progress')) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem', fontWeight: 700, color: 'var(--amber-light)',
          background: 'var(--amber-dim)', padding: '0.2rem 0.55rem', borderRadius: 3,
          border: '1px solid var(--amber-border)'
        }}>
          <span className="pulse-radar-dot" style={{ width: 5, height: 5 }} /> UNDER TEST
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)',
        fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)',
        background: 'var(--bg-panel)', padding: '0.2rem 0.55rem', borderRadius: 3,
        border: '1px solid var(--slate-border)'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getClassBadge = (accClass: string) => {
    switch (accClass) {
      case 'I': return <span className="badge-class-i">CLASS I</span>;
      case 'II': return <span className="badge-class-ii">CLASS II</span>;
      case 'III': return <span className="badge-class-iii">CLASS III</span>;
      default: return <span className="badge-class-iiii">CLASS {accClass}</span>;
    }
  };

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={14} /> OIML R-76 WEIGHING INSTRUMENTS REGISTRY
          </div>
          <h1 className="page-hero-title">
            Weighing Instruments Directory
          </h1>
          <p className="page-hero-subtitle">
            Manage laboratory balances, commercial scales, and industrial weighbridges. Click <strong>Test Scale</strong> to begin guided OIML verification.
          </p>
        </div>

        <button className="btn-precision-amber" onClick={() => setShowRegister(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> REGISTER NEW SCALE
        </button>
      </div>

      {/* Summary Stat Pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
          <Scale size={15} color="var(--steel-light)" />
          <span style={{ color: 'var(--text-secondary)' }}>Total Scales:</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{instruments.length}</span>
        </div>

        <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
          <CheckCircle2 size={15} color="var(--pass-green)" />
          <span style={{ color: 'var(--text-secondary)' }}>Compliant:</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--pass-green-light)' }}>{compliantCount}</span>
        </div>

        <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
          <Clock size={15} color="var(--amber)" />
          <span style={{ color: 'var(--text-secondary)' }}>Under Test:</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--amber-light)' }}>{underTestCount}</span>
        </div>

        {nonCompliantCount > 0 && (
          <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-panel)', borderRadius: 6, border: '1px solid var(--slate-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
            <AlertTriangle size={15} color="var(--fail-red)" />
            <span style={{ color: 'var(--text-secondary)' }}>Non-Compliant:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--fail-red-light)' }}>{nonCompliantCount}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-shelf">
        <div className="search-box-precision">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by serial number, manufacturer, model, or lab room…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          >
            <option value="">ALL VERIFICATION STATUSES</option>
            <option value="draft">DRAFT</option>
            <option value="registered">REGISTERED</option>
            <option value="configured">CONFIGURED</option>
            <option value="under_test">UNDER TEST</option>
            <option value="compliant">COMPLIANT</option>
            <option value="non_compliant">NON-COMPLIANT</option>
          </select>

          <select
            className="form-select"
            value={classFilter}
            onChange={e => { setClassFilter(e.target.value); setPage(1); }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          >
            <option value="">ALL ACCURACY CLASSES</option>
            <option value="I">CLASS I (SPECIAL - ANALYTICAL)</option>
            <option value="II">CLASS II (HIGH - PRECISION)</option>
            <option value="III">CLASS III (MEDIUM - COMMERCIAL)</option>
            <option value="IIII">CLASS IIII (ORDINARY - WEIGHBRIDGE)</option>
          </select>
        </div>
      </div>

      {/* Instruments Table */}
      <div className="tech-table-container">
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Scale size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>NO MATCHING WEIGHING INSTRUMENTS</div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.35rem' }}>
              {search || statusFilter || classFilter ? 'Adjust search parameters or clear filters.' : 'Register an instrument to initialize laboratory evaluation.'}
            </div>
          </div>
        ) : (
          <table className="tech-table">
            <thead>
              <tr>
                <th>IDENTIFIER / SERIAL</th>
                <th>EQUIPMENT SPECIFICATION</th>
                <th>ACCURACY CLASS</th>
                <th>CAPACITY & SCALE INTERVALS</th>
                <th>STATUS</th>
                <th>LOCATION</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(inst => {
                const isHovered = hoveredRowId === inst.id;
                const activeSession = testSessions.find(s => s.instrument_id === inst.id && s.status === 'in_progress');

                return (
                  <tr
                    key={inst.id}
                    onMouseEnter={() => setHoveredRowId(inst.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/instruments/${inst.id}`)}
                  >
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {inst.serial_number}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--amber)' }}>
                        {inst.instrument_id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inst.manufacturer} {inst.model}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {inst.instrument_type}
                      </div>
                    </td>

                    <td>{getClassBadge(inst.accuracy_class)}</td>

                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        Max: <strong>{inst.max_capacity?.toLocaleString()} {inst.unit}</strong>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        e={inst.verification_interval} {inst.unit} · n={inst.num_verification_intervals?.toLocaleString() || Math.round(inst.max_capacity / inst.verification_interval).toLocaleString()} divisions
                      </div>
                    </td>

                    <td>{getStatusBadge(inst.status)}</td>

                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inst.location}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{inst.owner_organization}</div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                        {activeSession ? (
                          <button
                            className="btn-precision-amber"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => navigate(`/testing/${activeSession.id}`)}
                            title="Continue active test"
                          >
                            <Play size={11} fill="currentColor" /> RESUME ({activeSession.progress}%)
                          </button>
                        ) : (
                          <button
                            className="btn-precision-amber"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => {
                              const sid = startTestingForInstrument(inst.id, 'accuracy');
                              navigate(`/testing/${sid}`);
                            }}
                            title="Start guided verification test"
                          >
                            <Play size={11} fill="currentColor" /> TEST SCALE
                          </button>
                        )}

                        <button
                          className="btn-precision-ghost"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => navigate(`/instruments/${inst.id}`)}
                          title="Inspect instrument specifications and configuration"
                        >
                          <Eye size={12} /> SPECS
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{
            padding: '0.85rem 1.25rem', borderTop: '1px solid var(--slate-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)'
          }}>
            <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} instruments</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                className="btn-precision-ghost"
                style={{ padding: '0.25rem 0.5rem' }}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                PREV
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`btn-precision-ghost ${page === i + 1 ? 'active' : ''}`}
                  style={{
                    padding: '0.25rem 0.55rem',
                    background: page === i + 1 ? 'var(--amber)' : undefined,
                    color: page === i + 1 ? '#000' : undefined
                  }}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn-precision-ghost"
                style={{ padding: '0.25rem 0.5rem' }}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {showRegister && <InstrumentRegistrationModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
