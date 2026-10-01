import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  Scale, FlaskConical, Play, X, Check, ArrowRight,
  ShieldAlert, RefreshCw, Box, HelpCircle
} from 'lucide-react';
import type { TestType } from '../types';

interface QuickTestModalProps {
  onClose: () => void;
  preselectedInstrumentId?: string;
}

const TEST_OPTIONS: {
  type: TestType;
  title: string;
  badge: string;
  desc: string;
  duration: string;
  loads: string;
}[] = [
  {
    type: 'accuracy',
    title: 'Weighing Performance (Accuracy)',
    badge: 'MANDATORY',
    desc: 'Applies increasing and decreasing test loads across the full weighing range (Min to Max) to determine true error E and check compliance against statutory MPE tolerances.',
    duration: '~8 mins',
    loads: 'Min, 500e, 2000e, Max'
  },
  {
    type: 'eccentricity',
    title: 'Eccentricity (Corner Loading)',
    badge: 'MANDATORY',
    desc: 'Applies ~1/3 of Max load at 4 off-center corner positions and center to verify that off-center placement does not introduce unacceptable measurement error.',
    duration: '~5 mins',
    loads: '1/3 Max on 5 positions'
  },
  {
    type: 'repeatability',
    title: 'Repeatability Test',
    badge: 'MANDATORY',
    desc: 'Applies identical test loads multiple times (typically 10 cycles at ~50% and ~100% capacity) to measure instrument measurement consistency and standard deviation.',
    duration: '~10 mins',
    loads: '10 cycles at 50% & 100%'
  },
  {
    type: 'tare_zero',
    title: 'Tare Balancing Verification',
    badge: 'OPTIONAL',
    desc: 'Tests accuracy and zero-setting after tare deduction across varying container weights.',
    duration: '~4 mins',
    loads: 'Subtractive tare loads'
  }
];

export default function QuickTestModal({ onClose, preselectedInstrumentId }: QuickTestModalProps) {
  const navigate = useNavigate();
  const { instruments, configurations, testPlans, saveConfiguration, generateTestPlan, startTestSession } = useAppStore();

  const [selectedInstId, setSelectedInstId] = useState<string>(
    preselectedInstrumentId || instruments[0]?.id || ''
  );
  const [selectedTestType, setSelectedTestType] = useState<TestType>('accuracy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedInst = instruments.find(i => i.id === selectedInstId);

  const handleStart = () => {
    if (!selectedInst) return;
    setIsSubmitting(true);

    try {
      // 1. Ensure configuration exists
      let config = configurations.find(c => c.instrument_id === selectedInst.id);
      if (!config) {
        config = saveConfiguration(selectedInst.id, {
          accuracy_class: selectedInst.accuracy_class,
          max_capacity: selectedInst.max_capacity,
          verification_interval: selectedInst.verification_interval,
          num_verification_intervals: selectedInst.num_verification_intervals,
          min_capacity: selectedInst.min_capacity,
          unit: selectedInst.unit,
          rule_version_id: 'r76-v1',
        });
      }

      // 2. Ensure test plan exists
      let plan = testPlans.find(p => p.instrument_id === selectedInst.id);
      if (!plan) {
        plan = generateTestPlan(selectedInst.id);
      }

      // 3. Start test session
      const session = startTestSession(plan.id, selectedTestType);

      onClose();
      navigate(`/testing/${session.id}`);
    } catch (err) {
      console.error('Failed to launch test session:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-box animate-entrance"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 680, width: '92%' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: 4 }}>
              <FlaskConical size={14} /> ONE-CLICK TEST LAUNCHER
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Start Verification Test
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Choose a weighing scale and test protocol. The system will guide you through test loads and MPE calculation.
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Step 1: Select Instrument */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
              Step 1 · Select Weighing Instrument
            </label>

            {instruments.length === 0 ? (
              <div style={{ padding: '1rem', background: 'var(--bg-panel)', borderRadius: 6, textAlign: 'center', color: 'var(--text-muted)' }}>
                No instruments registered yet. Please register an instrument first.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.65rem' }}>
                {instruments.map(inst => {
                  const isSelected = inst.id === selectedInstId;
                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInstId(inst.id)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 6,
                        border: isSelected ? '1px solid var(--amber)' : '1px solid var(--slate-border)',
                        background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-panel)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isSelected ? 'var(--amber)' : 'var(--text-secondary)', fontWeight: 700 }}>
                          {inst.serial_number}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-primary)',
                        }}>
                          Class {inst.accuracy_class}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inst.manufacturer} {inst.model}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        Max: {inst.max_capacity?.toLocaleString()} {inst.unit} · e={inst.verification_interval} {inst.unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Select Test Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
              Step 2 · Select OIML R-76 Test Protocol
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {TEST_OPTIONS.map(opt => {
                const isSelected = opt.type === selectedTestType;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedTestType(opt.type)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 6,
                      border: isSelected ? '1px solid var(--amber)' : '1px solid var(--slate-border)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-panel)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: isSelected ? '5px solid var(--amber)' : '2px solid var(--text-dim)',
                      marginTop: 2,
                      flexShrink: 0,
                      background: isSelected ? '#fff' : 'transparent',
                    }} />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {opt.title}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--amber)', background: 'var(--amber-dim)', padding: '1px 6px', borderRadius: 3 }}>
                            {opt.badge}
                          </span>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                            {opt.duration}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {opt.desc}
                      </p>
                      <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 4 }}>
                        Loads: {opt.loads}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HelpCircle size={14} color="var(--amber)" />
            Real-time R-76 MPE error calculation is automated.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-precision-ghost" onClick={onClose} disabled={isSubmitting}>
              CANCEL
            </button>
            <button
              className="btn-precision-amber"
              onClick={handleStart}
              disabled={!selectedInst || isSubmitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Play size={14} fill="currentColor" /> {isSubmitting ? 'INITIALIZING...' : 'LAUNCH WORKSTATION'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
