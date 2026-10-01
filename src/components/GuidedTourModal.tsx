import React, { useState } from 'react';
import {
  Sparkles, X, ArrowRight, ArrowLeft, CheckCircle2,
  Scale, FlaskConical, FileText, ShieldCheck, Play
} from 'lucide-react';

interface GuidedTourModalProps {
  onClose: () => void;
  onLaunchQuickTest: () => void;
}

const TOUR_STEPS = [
  {
    icon: Sparkles,
    badge: 'WELCOME TO METRO',
    title: 'Precision NAWI Verification Made Simple',
    subtitle: 'Developed for Smart India Hackathon 2026 (Problem SIH26035)',
    description: 'METRO eliminates manual paper test sheets and calculation errors by automating Non-Automatic Weighing Instrument (NAWI) verification strictly compliant with international standard OIML R-76.',
    bulletPoints: [
      'Zero manual math: calculates True Error E, Corrected Error Ec, and MPE dynamically.',
      'Prevents human error when verifying pharmacy balances, supermarket scales, and weighbridges.',
      'Generates official tamper-evident OIML R-76-2 certificates in seconds.'
    ],
    actionText: 'Next: How It Works'
  },
  {
    icon: Scale,
    badge: 'STEP 1 OF 3',
    title: 'Select or Register Weighing Scales',
    subtitle: 'Automatic Class Determination & Verification Scale Intervals',
    description: 'Every scale is cataloged with its maximum capacity (Max), verification interval (e), and accuracy class (Class I, II, III, or IIII).',
    bulletPoints: [
      'Scale Resolution Ratio (n = Max / e) automatically computed and verified.',
      'Supports Class I (Analytical), Class II (Precision), Class III (Commercial), Class IIII (Industrial).',
      'Pre-loaded with sample laboratory balances and industrial platform scales.'
    ],
    actionText: 'Next: Testing Workstation'
  },
  {
    icon: FlaskConical,
    badge: 'STEP 2 OF 3',
    title: 'Run Step-by-Step Guided Tests',
    subtitle: 'Interactive Workstation with Automated Error Calculation',
    description: 'During a test, the operator follows step-by-step test load instructions. The software automatically applies the Turning Point formula to eliminate digital display rounding errors.',
    bulletPoints: [
      'Weighing Performance, Eccentricity (corner loading), Repeatability, and Tare tests.',
      'Turning Point Calculator (ΔL) instantly determines changeover points.',
      'Real-time pass/fail evaluation against statutory MPE tolerances.'
    ],
    actionText: 'Next: Certified Reports'
  },
  {
    icon: FileText,
    badge: 'STEP 3 OF 3',
    title: 'Generate Official OIML Certificates',
    subtitle: 'Print-Ready Vector PDFs with 21 CFR Part 11 Audit Integrity',
    description: 'Once all tests are completed, the platform generates an official OIML R-76 Part 2 test certificate complete with calibration curves, tolerance bands, and reviewer sign-off.',
    bulletPoints: [
      'High-fidelity print-ready vector PDF export in 1 click.',
      'Cryptographic tamper-evident hash for audit and anti-counterfeiting.',
      'Role-based workflow for Operators, Reviewers, and Metrological Auditors.'
    ],
    actionText: '⚡ Launch Quick Test Demo'
  }
];

export default function GuidedTourModal({ onClose, onLaunchQuickTest }: GuidedTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      onLaunchQuickTest();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-box animate-entrance"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 640, width: '92%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--amber-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber)'
            }}>
              <StepIcon size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 700 }}>
                {step.badge}
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {step.title}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              {step.subtitle}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {step.description}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-panel)',
            padding: '1rem',
            borderRadius: 6,
            border: '1px solid var(--slate-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            {step.bulletPoints.map((pt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={15} color="var(--pass-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Step Progress Dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: '0.5rem' }}>
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: idx === currentStep ? 'var(--amber)' : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn-precision-ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
          >
            <ArrowLeft size={14} /> PREVIOUS
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-precision-ghost" onClick={onClose}>
              SKIP TOUR
            </button>
            <button
              className="btn-precision-amber"
              onClick={handleNext}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {step.actionText} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
