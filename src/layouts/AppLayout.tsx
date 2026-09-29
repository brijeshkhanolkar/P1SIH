import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  LayoutDashboard, Scale, ClipboardList, FlaskConical, FileText,
  Archive, ScrollText, Users, Settings, BookOpen, Bell, Search,
  LogOut, ChevronRight, Menu, X, CheckCircle2, UserCheck, Shield
} from 'lucide-react';
import type { UserRole } from '../types';

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
    '/reports': 'Official Reports',
    '/repository': 'Instrument Repository',
    '/audit': 'Audit Trail',
    '/users': 'Users & Roles',
    '/rules': 'R-76 Rule Management',
    '/settings': 'Settings',
  };
  if (pathname.startsWith('/instruments/')) return 'Instrument Profile';
  if (pathname.startsWith('/testing/')) return 'Test Execution';
  if (pathname.startsWith('/reports/')) return 'Report Details';
  return map[pathname] || 'METROLOGY';
}

export default function AppLayout() {
  const { currentUser, logout, notifications, markNotificationRead, switchUserRole, testSessions } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeSessionsCount = testSessions.filter(s => s.status === 'in_progress').length;
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  const initials = currentUser?.full_name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/repository?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <h1>METROLOGY</h1>
              <div className="brand-subtitle">NAWI Testing System · OIML R-76</div>
            </div>
            <button
              className="btn-ghost"
              onClick={() => setMobileOpen(false)}
              style={{ display: mobileOpen ? 'block' : 'none' }}
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
                {item.label === 'Testing' && activeSessionsCount > 0 && (
                  <span className="badge">{activeSessionsCount}</span>
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

        {/* Persona Switcher & User Details */}
        <div className="sidebar-user" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.full_name}
              </div>
              <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>{currentUser?.role}</div>
            </div>
            <div className="sidebar-user-status">Online</div>
          </div>

          {/* Quick Persona Switcher for Evaluation */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div style={{ fontSize: 9, color: 'var(--steel)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
              Switch Persona
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {(['operator', 'reviewer', 'auditor', 'admin'] as UserRole[]).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => switchUserRole(role)}
                  style={{
                    padding: '3px 6px',
                    fontSize: 10,
                    textTransform: 'capitalize',
                    borderRadius: 3,
                    border: currentUser?.role === role ? '1px solid var(--amber)' : '1px solid var(--border)',
                    background: currentUser?.role === role ? 'var(--amber-dim)' : 'var(--navy-mid)',
                    color: currentUser?.role === role ? 'var(--amber)' : 'var(--steel-light)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        {/* Header */}
        <header className="app-header">
          <button
            className="header-icon-btn mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={16} />
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

          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="header-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search repository (Enter)…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="header-actions" ref={notifRef} style={{ position: 'relative' }}>
            {/* Notification Bell */}
            <button
              className="header-icon-btn"
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={16} />
              {unreadCount > 0 && <span className="notif-dot" />}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                width: 320, background: 'var(--navy-light)', border: '1px solid var(--border)',
                borderRadius: 6, boxShadow: 'var(--shadow-xl)', zIndex: 1000,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--navy)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pure-white)' }}>
                    Notifications ({unreadCount} unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 10, color: 'var(--amber)', padding: 0, cursor: 'pointer' }}
                      onClick={() => {
                        notifications.forEach(n => markNotificationRead(n.id));
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--steel)', fontSize: 12 }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.action_url) {
                            navigate(n.action_url);
                            setShowNotifications(false);
                          }
                        }}
                        style={{
                          padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                          cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(232, 133, 12, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: n.read ? 'var(--off-white)' : 'var(--amber)' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: 9, color: 'var(--steel)' }}>
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--steel-light)', lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="system-status">System Operational</div>

            <button
              className="header-icon-btn"
              onClick={logout}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
