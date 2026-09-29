import React from 'react';
import { useAppStore } from '../lib/store';
import { Users, Shield } from 'lucide-react';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['Full system access', 'Manage users & roles', 'Configure R-76 rules', 'System settings', 'All operations'],
  operator: ['Register instruments', 'Perform tests', 'Upload evidence', 'Generate reports', 'View test history'],
  reviewer: ['Review test results', 'Approve reports', 'View test history', 'Compliance review', 'Audit trail access'],
  auditor: ['Read-only access', 'View audit trail', 'View reports', 'View evidence', 'Export data'],
};

export default function UsersPage() {
  const { users, currentUser } = useAppStore();

  return (
    <div>
      <div className="page-header">
        <h2>Users & Roles</h2>
        <p>Manage user accounts and role-based access control.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Registered Users ({users.length})</div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>
                  {user.full_name}
                  {user.id === currentUser?.id && <span style={{ fontSize: 9, marginLeft: 6, padding: '1px 5px', background: 'var(--amber-dim)', color: 'var(--amber)', borderRadius: 2 }}>YOU</span>}
                </td>
                <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>{user.email}</td>
                <td><span className={`status-badge ${user.role === 'admin' ? 'warning' : 'pending'}`}>{user.role}</span></td>
                <td><span className={`status-badge ${user.is_active ? 'pass' : 'fail'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ fontSize: 11, color: 'var(--steel-light)' }}>{user.last_login ? new Date(user.last_login).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Role Permissions</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
            <div key={role} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--navy-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Shield size={14} color="var(--amber)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--off-white)', textTransform: 'capitalize' }}>{role}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {perms.map((p, i) => (
                  <li key={i} style={{ fontSize: 11, color: 'var(--steel-light)', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
