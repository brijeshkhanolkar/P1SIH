import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import CommandPalette from '../components/CommandPalette';
import {
  LayoutDashboard, Scale, ClipboardList, FlaskConical, FileText,
  Archive, ScrollText, Users, Settings, BookOpen, Bell, Search,
  LogOut, ChevronRight, Menu, X, CheckCircle2, UserCheck, Shield,
  ChevronLeft, Activity, Radio
} from 'lucide-react';
import type { UserRole } from '../types';

const NAV_ITEMS = [
  { to: '/', num: '01', icon: LayoutDashboard, label: 'OVERVIEW' },
  { to: '/instruments', num: '02', icon: Scale, label: 'INSTRUMENTS' },
  { to: '/test-plans', num: '03', icon: ClipboardList, label: 'TEST PLANS' },
  { to: '/testing', num: '04', icon: FlaskConical, label: 'TESTING' },
  { to: '/reports', num: '05', icon: FileText, label: 'REPORTS' },
  { to: '/repository', num: '06', icon: Archive, label: 'REPOSITORY' },
  { to: '/audit', num: '07', icon: ScrollText, label: 'AUDIT' },
];

const ADMIN_ITEMS = [
  { to: '/rules', icon: BookOpen, label: 'RULE ENGINE' },
  { to: '/users', icon: Users, label: 'USERS & ROLES' },
  { to: '/settings', icon: Settings, label: 'SETTINGS' },
];

function getBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return ['CONTROL ROOM', 'OVERVIEW'];
  return ['SYSTEM', ...segments.map(s => s.replace(/-/g, ' ').toUpperCase())];
}

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/': 'TESTING CONTROL',
    '/instruments': 'INSTRUMENTS REGISTRY',
    '/test-plans': 'TEST PLAN SEQUENCER',
    '/testing': 'ACTIVE TESTING WORKSTATION',
    '/reports': 'OFFICIAL TEST CERTIFICATES',
    '/repository': 'EQUIPMENT REPOSITORY',
    '/audit': 'METROLOGICAL AUDIT TRAIL',
    '/users': 'USER ACCESS CONTROL',
    '/rules': 'OIML R-76 RULE CONFIGURATION',
    '/settings': 'SYSTEM PARAMETERS',
  };
  if (pathname.startsWith('/instruments/')) return 'INSTRUMENT DIAGNOSTICS';
  if (pathname.startsWith('/testing/')) return 'GUIDED TESTING WORKSTATION';
  if (pathname.startsWith('/reports/')) return 'REPORT VERIFICATION';
  return map[pathname] || 'METROLOGY SYSTEM';
}

export default function AppLayout() {
  const { currentUser, logout, notifications, markNotificationRead, switchUserRole, testSessions } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

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

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Ambient background engineering grid */}
      <div className="ambient-engineering-grid" />

      {/* WORKSTATION SIDEBAR */}
      <aside className={`workstation-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed ? (
            <div className="brand-badge">
              <div className="brand-logo-icon">
                <Radio size={18} />
              </div>
              <div className="brand-titles">
                <span className="brand-title">METRO</span>
                <span className="brand-subtitle">PRECISION TESTING</span>
              </div>
            </div>
          ) : (
            <div className="brand-logo-icon" style={{ margin: '0 auto' }}>
              <Radio size={16} />
            </div>
          )}

          <button
            className="btn-ghost"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand workstation' : 'Collapse workstation'}
            style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {!sidebarCollapsed && (
            <div className="nav-section-title">
              <span>WORKSTATIONS</span>
            </div>
          )}

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = item.to === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="nav-active-line"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="nav-num">{item.num}</span>
                <Icon size={16} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          <div style={{ margin: '1rem 0 0.5rem' }}>
            {!sidebarCollapsed ? (
              <div className="nav-section-title">
                <span>ADMINISTRATION</span>
              </div>
            ) : (
              <div style={{ height: 1, background: 'var(--slate-border)', margin: '0.75rem 0.5rem' }} />
            )}
          </div>

          {ADMIN_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="nav-active-line"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={16} style={{ marginLeft: sidebarCollapsed ? 0 : 4 }} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Terminal */}
        <div style={{
          padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem 1.25rem',
          borderTop: '1px solid var(--slate-border)',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--bg-panel-hover), var(--bg-void))',
                border: '1px solid var(--slate-border-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber)'
              }}>
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {currentUser?.full_name || 'Operator'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--amber)', textTransform: 'uppercase' }}>
                  {currentUser?.role || 'operator'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-panel)', border: '1px solid var(--slate-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--amber)'
            }}>
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
          )}

          {!sidebarCollapsed && (
            <button
              className="btn-ghost"
              onClick={logout}
              title="Logout from terminal"
              style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* LAYERED FLOATING TOP BAR */}
      <header className="workstation-topbar">
        <div className="topbar-left">
          <div className="system-status-indicator">
            <span className="pulse-radar-dot" />
            <span>SYSTEM: OPERATIONAL</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span style={{ color: 'var(--slate-border-light)' }}>/</span>}
                <span style={{ color: idx === breadcrumbs.length - 1 ? 'var(--text-secondary)' : 'var(--text-dim)' }}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="topbar-right">
          {/* Global Command Search (⌘K / Ctrl+K) */}
          <button
            className="cmd-palette-btn"
            onClick={() => setCmdOpen(true)}
            title="Search instruments, tests, reports (Ctrl + K)"
          >
            <Search size={14} />
            <span>Search System</span>
            <span className="cmd-key">⌘K</span>
          </button>

          {/* Quick Persona Switcher */}
          <div className="persona-switcher" title="Switch active metrology role">
            <button
              className={`persona-btn ${currentUser?.role === 'operator' ? 'active' : ''}`}
              onClick={() => switchUserRole('operator')}
            >
              OPERATOR
            </button>
            <button
              className={`persona-btn ${currentUser?.role === 'reviewer' ? 'active' : ''}`}
              onClick={() => switchUserRole('reviewer')}
            >
              REVIEWER
            </button>
            <button
              className={`persona-btn ${currentUser?.role === 'auditor' ? 'active' : ''}`}
              onClick={() => switchUserRole('auditor')}
            >
              AUDITOR
            </button>
            <button
              className={`persona-btn ${currentUser?.role === 'admin' ? 'active' : ''}`}
              onClick={() => switchUserRole('admin')}
            >
              ADMIN
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              className="btn-precision-ghost"
              style={{ padding: '0.45rem', position: 'relative' }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2, width: 8, height: 8,
                  borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)'
                }} />
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 340,
                background: 'var(--bg-surface)', border: '1px solid var(--slate-border-light)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-elevated)',
                padding: '0.75rem', zIndex: 50
              }} className="animate-entrance">
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: '0.5rem', borderBottom: '1px solid var(--slate-border)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)'
                }}>
                  <span>SYSTEM NOTIFICATIONS ({notifications.length})</span>
                  {unreadCount > 0 && <span style={{ color: 'var(--amber)' }}>{unreadCount} UNREAD</span>}
                </div>

                <div style={{ maxHeight: 280, overflowY: 'auto', marginTop: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                      No active alerts
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          padding: '0.65rem', borderRadius: 4, marginBottom: '0.25rem',
                          background: n.read ? 'transparent' : 'rgba(245, 158, 11, 0.05)',
                          borderLeft: `2px solid ${n.read ? 'var(--slate-border)' : 'var(--amber)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{n.message}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                          {new Date(n.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN WORKSTATION CANVAS */}
      <main className="workstation-main">
        <Outlet />
      </main>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
