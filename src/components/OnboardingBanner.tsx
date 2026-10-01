import React, { useState, useEffect } from 'react';
import { Sparkles, X, Play, BookOpen } from 'lucide-react';

interface OnboardingBannerProps {
  onStartTour: () => void;
  onQuickTest: () => void;
  onOpenExplainer: () => void;
}

export default function OnboardingBanner({ onStartTour, onQuickTest, onOpenExplainer }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('metro_onboarding_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('metro_onboarding_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className="animate-entrance"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        background: '#ffffff',
        border: '1px solid #ddd6fe',
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)'
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome to the NAWI OIML R-76 Testing Platform
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Verify weighing scales in 3 easy steps: select scale, enter readings with turning-point correction, and download certified reports.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button
          className="btn-precision-amber"
          onClick={onQuickTest}
          style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
        >
          <Play size={12} fill="currentColor" /> Start a Test
        </button>

        <button
          className="btn-precision-ghost"
          onClick={onStartTour}
          style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
        >
          60s Tour
        </button>

        <button
          className="btn-precision-ghost"
          onClick={onOpenExplainer}
          style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
        >
          <BookOpen size={12} /> Guide
        </button>

        <button
          className="btn-ghost"
          onClick={handleDismiss}
          title="Dismiss"
          style={{ padding: '0.35rem', color: 'var(--text-dim)' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
