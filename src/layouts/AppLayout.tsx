import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { motion } from 'motion/react';
import CommandPalette from '../components/CommandPalette';
import QuickTestModal from '../components/QuickTestModal';
import OimlExplainerModal from '../components/OimlExplainerModal';
import GuidedTourModal from '../components/GuidedTourModal';
import {
  LayoutDashboard, Scale, FlaskConical, FileText,
  ScrollText, Users, Settings, BookOpen, Bell, Search,
  LogOut, ChevronRight, Play, CheckCircle2, ChevronLeft,
  Sparkles, HelpCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/instruments', icon: Scale, label: 'Weighing Scales' },
  { to: '/testing', icon: FlaskConical, label: 'Testing' },
  { to: '/reports', icon: FileText, label: 'Certificates' },
  { to: '/audit', icon: ScrollText, label: 'Audit Trail' },
  { to: '/rules', icon: BookOpen, label: 'OIML Rules' },
];

const ADMIN_ITEMS = [
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function getBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return ['OIML R-76', 'Overview'];
  return ['METRO', ...segments.map(s => s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))];
}

export default function AppLayout() {
  const {
    currentUser, logout, notifications, markNotificationRead, switchUserRole,
    quickTestOpen, setQuickTestOpen, quickTestInstrumentId,
    explainerOpen, setExplainerOpen,
    tourOpen, setTourOpen
  } = useAppStore();

  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const breadcrumbs = getBreadcrumbs(location.pathname);

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
      {/* WHITE & PURPLE SIDEBAR */}
      <aside className={`workstation-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed ? (
            <div className="brand-badge" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <div className="brand-logo-icon">
                <Scale size={20} />
              </div>
              <div className="brand-titles">
                <span className="brand-title">METRO</span>
                <span className="brand-subtitle">OIML R-76 VERIFY</span>
              </div>
            </div>
          ) : (
            <div className="brand-logo-icon" style={{ margin: '0 auto', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Scale size={18} />
            </div>
          )}

          <button
            className="btn-ghost"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {!sidebarCollapsed && (
            <div className="nav-section-title">
              <span>NAVIGATION</span>
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
                <Icon size={18} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          {currentUser?.role === 'admin' && (
            <>
              <div style={{ margin: '0.75rem 0 0.25rem' }}>
                {!sidebarCollapsed && (
                  <div className="nav-section-title">
                    <span>ADMIN</span>
                  </div>
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
                    <Icon size={18} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </>
          )}

          {/* Quick Tour trigger in sidebar */}
          {!sidebarCollapsed && (
            <div style={{ marginTop: 'auto', padding: '0.75rem 0.5rem 0' }}>
              <div
                onClick={() => setTourOpen(true)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--purple)', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Sparkles size={14} /> Need Help?
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Take a 60-second guided tour of the testing workflow.
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer User Info */}
        <div style={{
          padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem 1.25rem',
          borderTop: '1px solid var(--slate-border)',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                background: '#ede9fe',
                border: '1px solid #ddd6fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)'
              }}>
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {currentUser?.full_name || 'Operator'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--purple)', textTransform: 'capitalize', fontWeight: 600 }}>
                  {currentUser?.role || 'operator'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              background: '#ede9fe', border: '1px solid #ddd6fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--purple)'
            }}>
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
          )}

          {!sidebarCollapsed && (
            <button
              className="btn-ghost"
              onClick={logout}
              title="Logout"
              style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="workstation-topbar">
        <div className="topbar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span style={{ color: 'var(--steel)' }}>/</span>}
                <span style={{ color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400 }}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="topbar-right">
          {/* Quick Start Test Button */}
          <button
            className="btn-precision-amber"
            onClick={() => setQuickTestOpen(true)}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
          >
            <Play size={12} fill="currentColor" /> Start Test
          </button>

          {/* OIML R-76 Guide */}
          <button
            className="btn-precision-ghost"
            onClick={() => setExplainerOpen(true)}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
          >
            <BookOpen size={13} /> Guide
          </button>

          {/* Search Button */}
          <button
            className="cmd-palette-btn"
            onClick={() => setCmdOpen(true)}
            title="Search (Ctrl + K)"
          >
            <Search size={14} />
            <span>Search</span>
            <span className="cmd-key">⌘K</span>
          </button>

          {/* Persona Switcher */}
          <div className="persona-switcher">
            {(['operator', 'reviewer', 'auditor', 'admin'] as const).map(role => (
              <button
                key={role}
                className={`persona-btn ${currentUser?.role === role ? 'active' : ''}`}
                onClick={() => switchUserRole(role)}
                style={{ textTransform: 'capitalize' }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Notifications */}
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
                  borderRadius: '50%', background: 'var(--purple)', boxShadow: '0 0 6px var(--purple)'
                }} />
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 320,
                background: '#ffffff', border: '1px solid var(--slate-border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-elevated)',
                padding: '0.75rem', zIndex: 50
              }} className="animate-entrance">
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: '0.5rem', borderBottom: '1px solid var(--slate-border)',
                  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)'
                }}>
                  <span>Notifications ({notifications.length})</span>
                  {unreadCount > 0 && <span style={{ color: 'var(--purple)' }}>{unreadCount} new</span>}
                </div>

                <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          padding: '0.65rem', borderRadius: 6, marginBottom: '0.25rem',
                          background: n.read ? 'transparent' : '#f5f3ff',
                          borderLeft: `3px solid ${n.read ? '#e2e8f0' : 'var(--purple)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{n.message}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* MAIN VIEW */}
      <main className="workstation-main">
        <Outlet />
      </main>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Modals */}
      {quickTestOpen && (
        <QuickTestModal
          onClose={() => setQuickTestOpen(false)}
          preselectedInstrumentId={quickTestInstrumentId || undefined}
        />
      )}

      {explainerOpen && (
        <OimlExplainerModal onClose={() => setExplainerOpen(false)} />
      )}

      {tourOpen && (
        <GuidedTourModal
          onClose={() => setTourOpen(false)}
          onLaunchQuickTest={() => setQuickTestOpen(true)}
        />
      )}
    </div>
  );
}
