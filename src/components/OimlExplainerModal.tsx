import React, { useState } from 'react';
import {
  BookOpen, X, Scale, Calculator, CheckCircle2, AlertTriangle,
  Info, ArrowRight, ShieldCheck, ChevronRight, Sparkles
} from 'lucide-react';

interface OimlExplainerModalProps {
  onClose: () => void;
}

export default function OimlExplainerModal({ onClose }: OimlExplainerModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'classes' | 'mpe' | 'calculator'>('basics');

  // Interactive Calculator Sandbox State
  const [sandboxLoad, setSandboxLoad] = useState<number>(1000);
  const [sandboxIndicated, setSandboxIndicated] = useState<number>(1000);
  const [sandboxE, setSandboxE] = useState<number>(1);
  const [sandboxDeltaL, setSandboxDeltaL] = useState<number>(0.4);
  const [sandboxClass, setSandboxClass] = useState<'I' | 'II' | 'III' | 'IIII'>('III');

  // Compute live error in sandbox
  // Formula: E = I + 0.5*e - deltaL - L
  const sandboxTrueError = sandboxIndicated + 0.5 * sandboxE - sandboxDeltaL - sandboxLoad;
  const mInE = sandboxLoad / sandboxE;
  
  // MPE for Class III:
  // 0 to 500e => 0.5e
  // 500e to 2000e => 1.0e
  // > 2000e => 1.5e
  let sandboxMpe = 0.5 * sandboxE;
  if (sandboxClass === 'III') {
    if (mInE <= 500) sandboxMpe = 0.5 * sandboxE;
    else if (mInE <= 2000) sandboxMpe = 1.0 * sandboxE;
    else sandboxMpe = 1.5 * sandboxE;
  } else if (sandboxClass === 'II') {
    if (mInE <= 5000) sandboxMpe = 0.5 * sandboxE;
    else if (mInE <= 20000) sandboxMpe = 1.0 * sandboxE;
    else sandboxMpe = 1.5 * sandboxE;
  } else if (sandboxClass === 'I') {
    if (mInE <= 50000) sandboxMpe = 0.5 * sandboxE;
    else if (mInE <= 200000) sandboxMpe = 1.0 * sandboxE;
    else sandboxMpe = 1.5 * sandboxE;
  } else {
    // Class IIII
    if (mInE <= 50) sandboxMpe = 0.5 * sandboxE;
    else if (mInE <= 200) sandboxMpe = 1.0 * sandboxE;
    else sandboxMpe = 1.5 * sandboxE;
  }

  const isCompliant = Math.abs(sandboxTrueError) <= sandboxMpe;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-box animate-entrance"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 840, width: '94%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: 4 }}>
              <BookOpen size={14} /> LEGAL METROLOGY REFERENCE
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              OIML R-76 & NAWI Explained Simply
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Everything a beginner needs to understand weighing scale verification, accuracy classes, and error tolerances.
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--slate-border)',
          padding: '0 1.5rem',
          background: 'rgba(0,0,0,0.15)'
        }}>
          {[
            { id: 'basics', label: '1. What is NAWI & R-76?' },
            { id: 'classes', label: '2. The 4 Accuracy Classes' },
            { id: 'mpe', label: '3. Error Tolerances (MPE)' },
            { id: 'calculator', label: '4. Interactive Calculator Sandbox' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--amber)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--amber)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(0,0,0,0.2))',
                border: '1px solid var(--amber-border)',
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--amber)', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Scale size={20} /> What is a Non-Automatic Weighing Instrument (NAWI)?
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginTop: 8 }}>
                  A <strong>Non-Automatic Weighing Instrument (NAWI)</strong> is any weighing device that requires an operator to place or remove test loads onto the pan or platform (unlike continuous conveyor belts or automated batchers).
                  Examples include laboratory analytical balances, grocery shop price-computing scales, and industrial weighbridges.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="tech-panel" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} color="var(--pass-green)" /> Why OIML R-76 Matters
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <strong>OIML Recommendation R-76</strong> is the global gold standard used by governments worldwide for Legal Metrology. It ensures that consumers are not cheated at the grocery store, patients get exact pharmaceutical dosages, and trade shipments are accurately billed.
                  </p>
                </div>

                <div className="tech-panel" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calculator size={16} color="var(--amber)" /> The 3 Core Tests
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Under R-76, every scale must pass three rigorous tests:
                    <br /><strong>1. Weighing Performance:</strong> Accurate across full range.
                    <br /><strong>2. Eccentricity:</strong> Accurate even if load is on the edge.
                    <br /><strong>3. Repeatability:</strong> Gives the same reading every time.
                  </p>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-panel)',
                padding: '1rem',
                borderRadius: 6,
                border: '1px solid var(--slate-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ color: 'var(--amber)', fontWeight: 700, marginBottom: 4 }}>Key Notation Glossary:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: 6 }}>
                  <div><strong>Max:</strong> Maximum safe capacity</div>
                  <div><strong>Min:</strong> Lowest statutory verified load</div>
                  <div><strong>e:</strong> Verification scale interval</div>
                  <div><strong>n:</strong> Number of divisions (Max / e)</div>
                  <div><strong>L:</strong> Standard test load applied</div>
                  <div><strong>I:</strong> Indicated value on scale display</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLASSES */}
          {activeTab === 'classes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                OIML R-76 divides all weighing instruments into 4 international accuracy classes based on division value (<strong>e</strong>) and number of intervals (<strong>n = Max / e</strong>):
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {/* Class I */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 6,
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  background: 'rgba(168, 85, 247, 0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c084fc', fontSize: '0.85rem' }}>
                      CLASS I · SPECIAL
                    </span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', background: 'rgba(168, 85, 247, 0.2)', padding: '2px 6px', borderRadius: 3, color: '#e9d5ff' }}>
                      n ≥ 50,000
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Ultra-Micro & Analytical Balances
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    Used in pharmaceutical research, sub-milligram chemistry labs, and nanotechnology. Extremely sensitive to ambient air currents and temperature.
                  </p>
                </div>

                {/* Class II */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 6,
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  background: 'rgba(59, 130, 246, 0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--info-blue-light)', fontSize: '0.85rem' }}>
                      CLASS II · HIGH
                    </span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 6px', borderRadius: 3, color: '#bfdbfe' }}>
                      100 ≤ n ≤ 100,000
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Precision & Jewelry Balances
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    Used for weighing gold, gemstones, precious metals, and hospital pharmacy drug compounding. Typically 0.001g to 0.05g resolution.
                  </p>
                </div>

                {/* Class III */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 6,
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  background: 'rgba(16, 185, 129, 0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--pass-green-light)', fontSize: '0.85rem' }}>
                      CLASS III · MEDIUM (MOST COMMON)
                    </span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: 3, color: '#a7f3d0' }}>
                      500 ≤ n ≤ 10,000
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Commercial Retail & Industrial Scales
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    Supermarket checkout scales, deli counter scales, package parcel shipping scales, warehouse platform scales. Over 80% of scales worldwide are Class III.
                  </p>
                </div>

                {/* Class IIII */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 6,
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  background: 'rgba(245, 158, 11, 0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--amber-light)', fontSize: '0.85rem' }}>
                      CLASS IIII · ORDINARY
                    </span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: 3, color: '#fde68a' }}>
                      100 ≤ n ≤ 1,000
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Heavy Weighbridges & Vehicle Scales
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    10 to 100-tonne truck weighbridges, crane scales, scrap metal hoppers, railroad car scales.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MPE */}
          {activeTab === 'mpe' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Maximum Permissible Error (MPE) §3.5.1
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  The law does not expect any weighing instrument to be 100.000% perfect. Instead, OIML R-76 establishes statutory tolerance bands (MPE). If the measured error is within the MPE band, the scale is legally certified.
                </p>
              </div>

              <div style={{
                background: 'var(--bg-panel)',
                borderRadius: 8,
                border: '1px solid var(--slate-border)',
                overflow: 'hidden'
              }}>
                <table className="tech-table">
                  <thead>
                    <tr>
                      <th>STATUTORY TOLERANCE (MPE)</th>
                      <th>CLASS I</th>
                      <th>CLASS II</th>
                      <th>CLASS III (COMMERCIAL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--pass-green)', fontWeight: 700 }}>± 0.5 e</td>
                      <td>0 ≤ m ≤ 50,000 e</td>
                      <td>0 ≤ m ≤ 5,000 e</td>
                      <td>0 ≤ m ≤ 500 e</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--amber)', fontWeight: 700 }}>± 1.0 e</td>
                      <td>50,000 &lt; m ≤ 200,000 e</td>
                      <td>5,000 &lt; m ≤ 20,000 e</td>
                      <td>500 &lt; m ≤ 2,000 e</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--fail-red)', fontWeight: 700 }}>± 1.5 e</td>
                      <td>m &gt; 200,000 e</td>
                      <td>20,000 &lt; m ≤ 100,000 e</td>
                      <td>2,000 &lt; m ≤ 10,000 e</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--slate-border)',
                borderRadius: 6,
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>
                  Why do we need the Turning Point Calculator (ΔL)?
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  A digital scale display automatically rounds numbers to the nearest integer. For example, if the display shows <strong>1000g</strong>, the true load could be anything from 999.5g to 1000.4g!
                  <br /><br />
                  To find the exact unrounded error, metrologists place tiny fractional weights ΔL (typically 0.1e) until the display jumps to 1001g.
                  The exact true error formula is:
                  <div style={{
                    margin: '8px 0',
                    padding: '8px',
                    background: 'var(--bg-void)',
                    border: '1px solid var(--slate-border-light)',
                    borderRadius: 4,
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--amber-light)',
                    fontSize: '0.85rem'
                  }}>
                    E = I + ½·e − ΔL − L
                  </div>
                  Our software computes this instantly in real-time as you type!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CALCULATOR SANDBOX */}
          {activeTab === 'calculator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Live Metrology Formula Sandbox
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Try tweaking values below to see how Error (E), MPE, and Compliance are determined in real-time!
                  </p>
                </div>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--amber)', background: 'var(--amber-dim)', padding: '2px 8px', borderRadius: 4 }}>
                  FORMULA: E = I + ½e − ΔL − L
                </span>
              </div>

              {/* Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    CLASS
                  </label>
                  <select
                    className="form-select"
                    value={sandboxClass}
                    onChange={e => setSandboxClass(e.target.value as any)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                  >
                    <option value="I">Class I (Special)</option>
                    <option value="II">Class II (High)</option>
                    <option value="III">Class III (Commercial)</option>
                    <option value="IIII">Class IIII (Ordinary)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    LOAD L (g)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={sandboxLoad}
                    onChange={e => setSandboxLoad(parseFloat(e.target.value) || 0)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    DISPLAY READING I (g)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={sandboxIndicated}
                    onChange={e => setSandboxIndicated(parseFloat(e.target.value) || 0)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    INTERVAL e (g)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={sandboxE}
                    onChange={e => setSandboxE(parseFloat(e.target.value) || 1)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    ADDED WEIGHT ΔL (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={sandboxDeltaL}
                    onChange={e => setSandboxDeltaL(parseFloat(e.target.value) || 0)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                  />
                </div>
              </div>

              {/* Real-time Calculation Result Display */}
              <div style={{
                padding: '1.25rem',
                borderRadius: 8,
                background: isCompliant ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${isCompliant ? 'var(--pass-green-border)' : 'var(--fail-red-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isCompliant ? 'var(--pass-green-dim)' : 'var(--fail-red-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompliant ? 'var(--pass-green)' : 'var(--fail-red)'
                  }}>
                    {isCompliant ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  </div>

                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isCompliant ? 'var(--pass-green-light)' : 'var(--fail-red-light)',
                      letterSpacing: '0.05em'
                    }}>
                      VERDICT: {isCompliant ? 'PASS (COMPLIANT)' : 'FAIL (OUTSIDE TOLERANCE)'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 2 }}>
                      True Error <strong>E = {sandboxTrueError >= 0 ? `+${sandboxTrueError.toFixed(3)}` : sandboxTrueError.toFixed(3)} g</strong> · MPE Tolerance: <strong>±{sandboxMpe.toFixed(3)} g</strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                  <div>Load in intervals: {mInE.toFixed(1)} e</div>
                  <div>Margin: {(sandboxMpe - Math.abs(sandboxTrueError)).toFixed(3)} g</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            OIML R 76-1 (2006) · Standard Metrological Compliance
          </div>
          <button className="btn-precision-amber" onClick={onClose}>
            GOT IT, CLOSE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
}
