import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Plus, Search, Scale, Filter, ChevronDown } from 'lucide-react';
import InstrumentRegistrationModal from '../components/InstrumentRegistrationModal';

export default function InstrumentsPage() {
  const navigate = useNavigate();
  const { instruments } = useAppStore();
  const [showRegister, setShowRegister] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return instruments.filter(i => {
      const matchSearch = !search || [i.instrument_id, i.manufacturer, i.model, i.serial_number]
        .some(f => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = !statusFilter || i.status === statusFilter;
      const matchClass = !classFilter || i.accuracy_class === classFilter;
      return matchSearch && matchStatus && matchClass;
    });
  }, [instruments, search, statusFilter, classFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Instruments</h2>
            <p>Manage registered weighing instruments and their verification status.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
            <Plus size={14} /> Register Instrument
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="header-search" style={{ width: 260 }}>
          <Search />
          <input
            type="text" className="form-input"
            placeholder="Search by ID, manufacturer, model…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="registered">Registered</option>
          <option value="configured">Configured</option>
          <option value="under_test">Under Test</option>
          <option value="compliant">Compliant</option>
          <option value="non_compliant">Non-Compliant</option>
          <option value="review">Review</option>
        </select>
        <select className="form-select" value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}>
          <option value="">All Classes</option>
          <option value="I">Class I</option>
          <option value="II">Class II</option>
          <option value="III">Class III</option>
          <option value="IIII">Class IIII</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Scale />
            <h3>No instruments found</h3>
            <p>{search || statusFilter || classFilter ? 'Try adjusting your filters.' : 'Register your first instrument to get started.'}</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instrument ID</th>
                  <th>Manufacturer</th>
                  <th>Model</th>
                  <th>Class</th>
                  <th>Max / e</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(inst => (
                  <tr
                    key={inst.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/instruments/${inst.id}`)}
                  >
                    <td className="mono" style={{ fontWeight: 600 }}>{inst.instrument_id}</td>
                    <td>{inst.manufacturer}</td>
                    <td>{inst.model}</td>
                    <td>{inst.accuracy_class}</td>
                    <td className="mono" style={{ fontSize: 11 }}>
                      {inst.max_capacity} / {inst.verification_interval} {inst.unit}
                    </td>
                    <td>
                      <span className={`status-badge ${inst.status.replace('_', '-')}`}>
                        {inst.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>{inst.location}</td>
                    <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>
                      {new Date(inst.date_received).toLocaleDateString()}
                    </td>
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

      {showRegister && <InstrumentRegistrationModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
