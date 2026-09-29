import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Search, Scale, FileText, FlaskConical, LayoutDashboard, X, ArrowRight, CornerDownLeft } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { instruments, reports, testSessions } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open handled by parent
        }
      }
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable items
  const cleanQ = query.trim().toLowerCase();

  interface SearchItem {
    id: string;
    title: string;
    category: string;
    meta?: string;
    icon: any;
    path: string;
  }

  const quickNav: SearchItem[] = [
    { id: 'nav-1', title: '01 Overview / Testing Control', category: 'Navigation', icon: LayoutDashboard, path: '/' },
    { id: 'nav-2', title: '02 Instruments Registry', category: 'Navigation', icon: Scale, path: '/instruments' },
    { id: 'nav-3', title: '03 Test Plans Sequence', category: 'Navigation', icon: FlaskConical, path: '/test-plans' },
    { id: 'nav-4', title: '04 Active Testing Workstation', category: 'Navigation', icon: FlaskConical, path: '/testing' },
    { id: 'nav-5', title: '05 Official Test Reports', category: 'Navigation', icon: FileText, path: '/reports' },
    { id: 'nav-6', title: '06 Instrument Repository', category: 'Navigation', icon: Scale, path: '/repository' },
    { id: 'nav-7', title: '07 Metrology Audit Trail', category: 'Navigation', icon: FileText, path: '/audit' },
  ];

  const matchedInstruments: SearchItem[] = instruments.map(inst => ({
    id: inst.id,
    title: `${inst.manufacturer} ${inst.model} (${inst.serial_number})`,
    category: 'Instrument',
    meta: `Class ${inst.accuracy_class} · Max ${inst.max_capacity}${inst.unit}`,
    icon: Scale,
    path: `/instruments/${inst.id}`,
  }));

  const matchedReports: SearchItem[] = reports.map(r => ({
    id: r.id,
    title: `Report ${r.report_number}`,
    category: 'Report',
    meta: `Status: ${(r.approval_status || r.compliance_result)?.toUpperCase()} · ${r.compliance_summary?.overall_result?.toUpperCase() || 'PENDING'}`,
    icon: FileText,
    path: `/reports/${r.id}`,
  }));

  const allItems: SearchItem[] = [...quickNav, ...matchedInstruments, ...matchedReports];

  const filteredItems = cleanQ
    ? allItems.filter(item => 
        item.title.toLowerCase().includes(cleanQ) || 
        item.category.toLowerCase().includes(cleanQ) ||
        (item.meta && item.meta.toLowerCase().includes(cleanQ))
      )
    : allItems.slice(0, 10);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].path);
      }
    }
  };

  return (
    <div className="cmd-palette-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cmd-palette-window animate-entrance">
        <div className="cmd-palette-search-row">
          <Search size={20} color="var(--amber)" />
          <input
            ref={inputRef}
            className="cmd-palette-input"
            placeholder="Type a command, instrument, serial number, or report..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleInputKeyDown}
          />
          <button className="btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="cmd-palette-results">
          {filteredItems.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>NO MATCHING METROLOGY RECORDS</div>
              <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>No instrument, report, or test matches "{query}".</div>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`cmd-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-palette-item-left">
                    <div style={{
                      width: 28, height: 28, borderRadius: 4, background: 'var(--bg-void)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid var(--slate-border)', color: isSelected ? 'var(--amber)' : 'var(--text-muted)'
                    }}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {item.title}
                      </div>
                      {item.meta && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {item.meta}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase',
                      padding: '0.15rem 0.45rem', borderRadius: 3, background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-dim)', border: '1px solid var(--slate-border)'
                    }}>
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft size={13} color="var(--amber)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{
          padding: '0.65rem 1.25rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--slate-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem', color: 'var(--text-dim)'
        }}>
          <span>Use <kbd style={{ color: 'var(--amber)', background: 'var(--bg-void)', padding: '0.1rem 0.3rem', borderRadius: 2 }}>↑</kbd> <kbd style={{ color: 'var(--amber)', background: 'var(--bg-void)', padding: '0.1rem 0.3rem', borderRadius: 2 }}>↓</kbd> to navigate</span>
          <span>Press <kbd style={{ color: 'var(--amber)', background: 'var(--bg-void)', padding: '0.1rem 0.3rem', borderRadius: 2 }}>ENTER</kbd> to open · <kbd style={{ color: 'var(--amber)', background: 'var(--bg-void)', padding: '0.1rem 0.3rem', borderRadius: 2 }}>ESC</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
}
