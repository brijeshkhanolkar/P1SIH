import React, { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { ScrollText, Search, Download, ShieldCheck, User } from 'lucide-react';

export default function AuditPage() {
  const { auditLogs } = useAppStore();
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const uniqueUsers = useMemo(() => [...new Set(auditLogs.map(l => l.user_name))], [auditLogs]);
  const uniqueEntities = useMemo(() => [...new Set(auditLogs.map(l => l.entity_type))], [auditLogs]);

  const filtered = useMemo(() => {
    return auditLogs.filter(l => {
      const matchSearch = !search || [l.action, l.details, l.user_name].some(f => f.toLowerCase().includes(search.toLowerCase()));
      const matchUser = !userFilter || l.user_name === userFilter;
      const matchEntity = !entityFilter || l.entity_type === entityFilter;
      return matchSearch && matchUser && matchEntity;
    });
  }, [auditLogs, search, userFilter, entityFilter]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Entity Type', 'Entity ID', 'Action', 'Details'];
    const rows = filtered.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.user_name.replace(/"/g, '""')}"`,
      `"${l.user_role}"`,
      `"${l.entity_type}"`,
      `"${l.entity_id}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-hero">
        <div>
          <div className="text-tech-amber" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ScrollText size={14} /> 21 CFR PART 11 COMPLIANT LOG
          </div>
          <h1 className="page-hero-title">
            Metrological Audit Trail
          </h1>
          <p className="page-hero-subtitle">
            Tamper-evident, chronological log of all measurements, adjustments, operator inputs, and reviewer digital sign-offs.
          </p>
        </div>

        <button className="btn-precision-ghost" onClick={handleExportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> EXPORT AUDIT CSV
        </button>
      </div>

      <div className="filter-shelf">
        <div className="search-box-precision">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search audit trail by action, operator, or details…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-select" value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <option value="">ALL OPERATORS</option>
            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select className="form-select" value={entityFilter} onChange={e => setEntityFilter(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <option value="">ALL ENTITY TYPES</option>
            {uniqueEntities.map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="tech-table-container">
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ScrollText size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>NO AUDIT EVENTS FOUND</div>
          </div>
        ) : (
          <table className="tech-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>OPERATOR / USER</th>
                <th>ROLE</th>
                <th>ENTITY</th>
                <th>ACTION</th>
                <th>AUDIT DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                      {log.user_name}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase',
                      color: 'var(--amber)', background: 'var(--amber-dim)', padding: '1px 6px', borderRadius: 3
                    }}>
                      {log.user_role}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {log.entity_type}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    {log.action}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 380 }}>
                    {log.details}
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
