import React, { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { ScrollText, Search, Download } from 'lucide-react';

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
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Audit Trail</h2>
            <p>Tamper-evident record of all metrological events, test results, and laboratory approvals.</p>
          </div>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search" style={{ width: 280 }}>
          <Search size={14} />
          <input
            type="text"
            className="form-input"
            placeholder="Search audit events, users, actions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={userFilter} onChange={e => setUserFilter(e.target.value)}>
          <option value="">All Users</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select className="form-select" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
          <option value="">All Entities</option>
          {uniqueEntities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <ScrollText />
            <h3>No audit events found</h3>
            <p>Adjust your filters or perform actions to generate audit records.</p>
          </div>
        ) : (
          <div className="audit-timeline">
            {filtered.slice(0, 100).map(log => (
              <div key={log.id} className={`audit-entry ${log.user_id === 'system' ? 'system' : 'user'}`}>
                <div className="audit-timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                  <span style={{ marginLeft: 8, fontSize: 9, padding: '1px 5px', background: 'var(--charcoal)', borderRadius: 2, color: 'var(--steel-light)' }}>
                    {log.entity_type}
                  </span>
                </div>
                <div className="audit-actor">
                  {log.user_name}
                  <span style={{ fontSize: 10, color: 'var(--steel)', marginLeft: 6 }}>({log.user_role})</span>
                </div>
                <div className="audit-action">{log.details}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
