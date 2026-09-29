import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  LayoutDashboard, Scale, ClipboardList, FlaskConical, FileText,
  Archive, ScrollText, Users, Settings, BookOpen, Bell, Search,
  LogOut, ChevronRight, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/instruments', icon: Scale, label: 'Instruments' },
  { to: '/test-plans', icon: ClipboardList, label: 'Test Plans' },
  { to: '/testing', icon: FlaskConical, label: 'Testing' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/repository', icon: Archive, label: 'Repository' },
  { to: '/audit', icon: ScrollText, label: 'Audit Trail' },
];

const ADMIN_ITEMS = [
  { to: '/users', icon: Users, label: 'Users & Roles' },
  { to: '/rules', icon: BookOpen, label: 'R-76 Rules' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function getBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return ['Overview'];
  return segments.map(s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
}

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/': 'Testing Overview',
    '/instruments': 'Instruments',
    '/test-plans': 'Test Plans',
    '/testing': 'Active Testing',
    '/reports': 'Reports',
    '/repository': 'Instrument Repository',
    '/audit': 'Audit Trail',
    '/users': 'Users & Roles',
    '/rules': 'R-76 Rule Management',
    '/settings': 'Settings',
  };
  // Check for dynamic routes
  if (pathname.startsWith('/instruments/')) return 'Instrument Profile';
  if (pathname.startsWith('/testing/')) return 'Test Execution';
  if (pathname.startsWith('/reports/')) return 'Report Details';
  return map[pathname] || 'METROLOGY';
}

export default function AppLayout() {
  const { currentUser, logout, notifications } = useAppStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  const initials = currentUser?.full_name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1>METROLOGY</h1>
              <div className="brand-subtitle">NAWI Testing System</div>
            </div>
            <button
              className="btn-ghost"
              onClick={() => setMobileOpen(false)}
              style={{ display: 'none' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.label === 'Testing' && useAppStore.getState().testSessions.filter(s => s.status === 'in_progress').length > 0 && (
                  <span className="badge">{useAppStore.getState().testSessions.filter(s => s.status === 'in_progress').length}</span>
                )}
              </NavLink>
            ))}
          </div>

          {(currentUser?.role === 'admin' || currentUser?.role === 'reviewer') && (
            <div className="sidebar-section">
              <div className="sidebar-section-label">Administration</div>
              {ADMIN_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser?.full_name}</div>
            <div className="sidebar-user-role">{currentUser?.role}</div>
          </div>
          <div className="sidebar-user-status">Online</div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        {/* Header */}
        <header className="app-header">
          <button
            className="header-icon-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none' }}
          >
            <Menu />
          </button>

          <div className="header-breadcrumb">
            <span>METROLOGY</span>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={12} />
                <span className={i === breadcrumbs.length - 1 ? 'current' : ''}>{b}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="header-title">{pageTitle}</div>

          <div className="header-spacer" />

          <div className="header-search">
            <Search />
            <input
              type="text"
              placeholder="Search instruments, reports…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="header-icon-btn" title="Notifications">
              <Bell />
              {unreadCount > 0 && <span className="notif-dot" />}
            </button>

            <div className="system-status">System Operational</div>

            <button
              className="header-icon-btn"
              onClick={logout}
              title="Sign out"
            >
              <LogOut />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Demo indicator */}
      <div className="demo-indicator">Demo Data</div>
    </div>
  );
}
