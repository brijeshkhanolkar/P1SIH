import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Archive, Search, Scale, Play, Eye } from 'lucide-react';

export default function RepositoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const { instruments, testSessions, reports, startTestingForInstrument } = useAppStore();
  const [search, setSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (queryParam) {
      setSearch(queryParam);
    }
  }, [queryParam]);

  const enriched = useMemo(() => {
    return instruments.map(inst => {
      const sessions = testSessions.filter(s => s.instrument_id === inst.id);
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const reportCount = reports.filter(r => r.instrument_id === inst.id).length;
      const latestResult = completedSessions.length > 0
        ? (completedSessions.every(s => s.result === 'pass') ? 'pass' : 'fail')
        : 'pending';
      return { ...inst, sessions: sessions.length, completed: completedSessions.length, reportCount, latestResult };
    });
  }, [instruments, testSessions, reports]);

  const filtered = useMemo(() => {
    return enriched.filter(i => {
      const matchSearch = !search || [i.instrument_id, i.manufacturer, i.model, i.serial_number]
        .some(f => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = !statusFilter || i.status === statusFilter;
      const matchClass = !classFilter || i.accuracy_class === classFilter;
      const matchResult = !resultFilter || i.latestResult === resultFilter;
      return matchSearch && matchStatus && matchClass && matchResult;
    });
  }, [enriched, search, statusFilter, classFilter, resultFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Archive size={14} /> HISTORICAL METROLOGY ARCHIVE
          </div>
          <h1 className="page-hero-title">
            Equipment Repository Archive
          </h1>
          <p className="page-hero-subtitle">
            Long-term archive of all certified weighing equipment, lifetime test session records, and regulatory reports.
          </p>
        </div>
      </div>

      <div className="filter-shelf">
        <div className="search-box-precision">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by serial number, model, or manufacturer…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">ALL STATUS</option>
            <option value="compliant">COMPLIANT</option>
            <option value="non_compliant">NON-COMPLIANT</option>
            <option value="under_test">UNDER TEST</option>
            <option value="configured">CONFIGURED</option>
            <option value="registered">REGISTERED</option>
          </select>
          <select className="form-select" value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}>
            <option value="">ALL CLASSES</option>
            <option value="I">CLASS I</option>
            <option value="II">CLASS II</option>
            <option value="III">CLASS III</option>
            <option value="IIII">CLASS IIII</option>
          </select>
        </div>
      </div>

      <div className="tech-table-container">
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Archive size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>NO ARCHIVE RECORDS FOUND</div>
          </div>
        ) : (
          <table className="tech-table">
            <thead>
              <tr>
                <th>SERIAL / ID</th>
                <th>MANUFACTURER & MODEL</th>
                <th>CLASS</th>
                <th>STATUS</th>
                <th>VERDICT</th>
                <th>COMPLETED TESTS</th>
                <th>REPORTS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(inst => (
                <tr key={inst.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/instruments/${inst.id}`)}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {inst.serial_number}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--amber)' }}>
                      {inst.instrument_id}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inst.manufacturer} {inst.model}</div>
                  </td>
                  <td>
                    <span className={`badge-class-${inst.accuracy_class.toLowerCase()}`}>
                      CLASS {inst.accuracy_class}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${inst.status.replace('_', '-')}`}>
                      {inst.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${inst.latestResult}`}>
                      {inst.latestResult.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {inst.completed} / {inst.sessions}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--amber)' }}>
                    {inst.reportCount} issued
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                      <button
                        className="btn-precision-amber"
                        onClick={() => {
                          const sid = startTestingForInstrument(inst.id, 'accuracy');
                          navigate(`/testing/${sid}`);
                        }}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Play size={11} fill="currentColor" /> TEST
                      </button>
                      <button
                        className="btn-precision-ghost"
                        onClick={() => navigate(`/instruments/${inst.id}`)}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem' }}
                      >
                        <Eye size={11} /> VIEW
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
