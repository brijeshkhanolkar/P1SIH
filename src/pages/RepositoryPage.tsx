import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Archive, Search } from 'lucide-react';

export default function RepositoryPage() {
  const navigate = useNavigate();
  const { instruments, testSessions, reports } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

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
    <div>
      <div className="page-header">
        <h2>Instrument Repository</h2>
        <p>Searchable repository of all instruments, test results and reports.</p>
      </div>

      <div className="filter-bar">
        <div className="header-search" style={{ width: 260 }}>
          <Search />
          <input type="text" className="form-input" placeholder="Search by ID, serial, model…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="compliant">Compliant</option>
          <option value="non_compliant">Non-Compliant</option>
          <option value="under_test">Under Test</option>
          <option value="configured">Configured</option>
          <option value="registered">Registered</option>
        </select>
        <select className="form-select" value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}>
          <option value="">All Classes</option>
          <option value="I">Class I</option><option value="II">Class II</option>
          <option value="III">Class III</option><option value="IIII">Class IIII</option>
        </select>
        <select className="form-select" value={resultFilter} onChange={e => { setResultFilter(e.target.value); setPage(1); }}>
          <option value="">All Results</option>
          <option value="pass">Passed</option>
          <option value="fail">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Archive />
            <h3>No instruments match your criteria</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instrument ID</th><th>Manufacturer</th><th>Model</th><th>Serial #</th>
                  <th>Class</th><th>Status</th><th>Last Result</th><th>Tests</th><th>Reports</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(inst => (
                  <tr key={inst.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/instruments/${inst.id}`)}>
                    <td className="mono" style={{ fontWeight: 600 }}>{inst.instrument_id}</td>
                    <td>{inst.manufacturer}</td>
                    <td>{inst.model}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{inst.serial_number}</td>
                    <td>{inst.accuracy_class}</td>
                    <td><span className={`status-badge ${inst.status.replace('_', '-')}`}>{inst.status.replace('_', ' ')}</span></td>
                    <td><span className={`status-badge ${inst.latestResult}`}>{inst.latestResult}</span></td>
                    <td style={{ fontSize: 11 }}>{inst.completed}/{inst.sessions}</td>
                    <td style={{ fontSize: 11 }}>{inst.reportCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
                <div className="pagination-controls">
                  <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
