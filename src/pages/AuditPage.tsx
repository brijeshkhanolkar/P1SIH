import React, { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { ScrollText, Search, Filter } from 'lucide-react';

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

  return (
    <div>
      <div className="page-header">
        <h2>Audit Trail</h2>
        <p>Complete record of all system events, user actions and automated operations.</p>
      </div>

      <div className="filter-bar">
        <div className="header-search" style={{ width: 260 }}>
          <Search />
          <input type="text" className="form-input" placeholder="Search audit events…" value={search} onChange={e => setSearch(e.target.value)} />
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
            {filtered.slice(0, 50).map(log => (
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
