import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import {
  calculateError, generateTestLoads, getEccentricityLoad,
  ECCENTRICITY_POSITIONS, calculateRepeatability, getMPE
} from '../lib/r76-engine';
import type { TestMeasurement, TestResult, LoadCondition } from '../types';
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertTriangle,
  Save, Pause, Play, RotateCcw, Upload, Check, X as XIcon,
  ChevronRight, FlaskConical
} from 'lucide-react';

// === Measurement Visualization Component ===
function MPEVisualization({ error, mpe, result }: { error: number; mpe: number; result: TestResult }) {
  const absError = Math.abs(error);
  const maxRange = Math.max(mpe * 2, absError * 1.5);
  const centerPct = 50;
  const mpePctLeft = 50 - (mpe / maxRange) * 50;
  const mpePctRight = 50 + (mpe / maxRange) * 50;
  const markerPct = 50 + (error / maxRange) * 50;
  const clampedMarker = Math.max(2, Math.min(98, markerPct));

  return (
    <div className="measurement-viz">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--steel)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Error</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 600, color: result === 'pass' ? 'var(--green)' : 'var(--red)' }}>
            {error >= 0 ? '+' : ''}{error.toFixed(4)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--steel)', letterSpacing: 0.5, textTransform: 'uppercase' }}>MPE Band</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--off-white)' }}>
            ±{mpe.toFixed(4)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--steel)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Margin</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 600, color: result === 'pass' ? 'var(--green)' : 'var(--red)' }}>
            {result === 'pass' ? (mpe - absError).toFixed(4) : `−${(absError - mpe).toFixed(4)}`}
          </div>
        </div>
      </div>
      <div className="mpe-band">
        <div className="mpe-band-pass" style={{
          left: `${mpePctLeft}%`, width: `${mpePctRight - mpePctLeft}%`,
        }} />
        <div className={`mpe-band-marker ${result}`} style={{ left: `${clampedMarker}%` }} />
      </div>
      <div className="mpe-band-labels">
        <span>−{mpe.toFixed(2)}</span>
        <span>0</span>
        <span>+{mpe.toFixed(2)}</span>
      </div>
    </div>
  );
}

// === Result Display ===
function ResultDisplay({ result, reason, formula }: { result: TestResult; reason: string; formula?: string }) {
  return (
    <div className={`result-display ${result}`}>
      <div className={`result-icon ${result}`}>
        {result === 'pass' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <div className={`result-label ${result}`}>{result === 'pass' ? 'PASS — WITHIN MPE' : 'FAIL — EXCEEDS MPE'}</div>
          {formula && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 2 }}>
              {formula}
            </span>
          )}
        </div>
        <div className="result-details" style={{ marginTop: 4 }}>{reason}</div>
      </div>
    </div>
  );
}

export default function TestExecutionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const store = useAppStore();

  const session = store.testSessions.find(s => s.id === sessionId);
  const instrument = session ? store.instruments.find(i => i.id === session.instrument_id) : null;
  const config = instrument ? store.configurations.find(c => c.instrument_id === instrument.id) : null;
  const testPlan = session ? store.testPlans.find(p => p.id === session.test_plan_id) : null;

  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(session ? session.attempts.length - 1 : 0);
  const [useTurningPoint, setUseTurningPoint] = useState(false);
  const [deltaL, setDeltaL] = useState('');
  const [indicatedValue, setIndicatedValue] = useState('');
  const [loadCondition, setLoadCondition] = useState<LoadCondition>('increasing');
  const [observation, setObservation] = useState('');
  const [lastCalc, setLastCalc] = useState<{
    error: number;
    errorInE?: number;
    mpe: number;
    mpeInE?: number;
    result: TestResult;
    reason: string;
    formula?: string;
    margin?: number;
  } | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  if (!session || !instrument || !config) {
    return (
      <div className="empty-state" style={{ height: '60vh' }}>
        <FlaskConical />
        <h3>Test session not found</h3>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/testing')}>
          <ArrowLeft size={14} /> Back to Testing
        </button>
      </div>
    );
  }

  const activeAttempt = session.attempts[session.attempts.length - 1];
  const safeAttemptIdx = Math.min(selectedAttemptIndex, session.attempts.length - 1);
  const viewingAttempt = session.attempts[safeAttemptIdx] || activeAttempt;
  const isViewingActiveAttempt = viewingAttempt.id === activeAttempt.id;
  const measurements = viewingAttempt.measurements;

  // Test-specific config
  const testLoads = useMemo(() =>
    generateTestLoads(config.max_capacity, config.min_capacity, config.verification_interval, config.accuracy_class),
    [config]
  );
  const eccLoad = getEccentricityLoad(config.max_capacity);
  const repLoad = Math.round(config.max_capacity * 0.5 / config.verification_interval) * config.verification_interval;

  // Current step for accuracy (based on active attempt)
  const activeMeasurements = activeAttempt.measurements;
  const currentLoadIndex = session.test_type === 'accuracy' ? activeMeasurements.length : 0;
  const currentLoad = session.test_type === 'accuracy' ? testLoads[currentLoadIndex] : session.test_type === 'eccentricity' ? eccLoad : repLoad;
  const isComplete = session.test_type === 'accuracy'
    ? activeMeasurements.length >= testLoads.length
    : session.test_type === 'eccentricity'
    ? activeMeasurements.length >= ECCENTRICITY_POSITIONS.length
    : activeMeasurements.length >= 10;

  // Current instruction
  const getInstruction = () => {
    if (session.test_type === 'accuracy') {
      if (currentLoadIndex === 0) return 'Ensure the instrument is level and zeroed before beginning. Prepare the required reference weights.';
      if (isComplete) return 'All measurements recorded. Review results and complete the test.';
      return `Apply ${currentLoad} ${config.unit} reference load. Record the indicated value shown on the instrument.`;
    }
    if (session.test_type === 'eccentricity') {
      const posIndex = activeMeasurements.length;
      if (posIndex >= ECCENTRICITY_POSITIONS.length) return 'All eccentric positions measured. Review and complete.';
      const pos = ECCENTRICITY_POSITIONS[posIndex];
      return `Place ${eccLoad} ${config.unit} test load at the ${pos.label} of the load receptor. ${pos.description}. Record the indication.`;
    }
    if (session.test_type === 'repeatability') {
      if (activeMeasurements.length >= 10) return 'All 10 readings recorded. Review and complete.';
      return `Apply ${repLoad} ${config.unit} test load. Record the indicated value. Then fully remove the load and allow the instrument to stabilize before the next reading. (Reading ${activeMeasurements.length + 1} of 10)`;
    }
    return '';
  };

  const handleRecordMeasurement = () => {
    const value = parseFloat(indicatedValue);
    if (isNaN(value)) return;

    let error: number, mpe: number, result: TestResult, reason: string, formula: string | undefined, errorInE: number | undefined, mpeInE: number | undefined, margin: number | undefined;

    if (session.test_type === 'accuracy') {
      const parsedDelta = parseFloat(deltaL);
      const calcInput = useTurningPoint && !isNaN(parsedDelta)
        ? {
            indicatedValue: value,
            referenceLoad: currentLoad!,
            roundingCorrection: parsedDelta,
            scaleInterval: config.verification_interval,
          }
        : { indicatedValue: value, referenceLoad: currentLoad! };

      const calc = calculateError(
        calcInput,
        config.accuracy_class,
        config.verification_interval
      );
      error = calc.error;
      mpe = calc.mpe;
      result = calc.result;
      reason = calc.reason;
      formula = calc.formula;
      errorInE = calc.errorInE;
      mpeInE = calc.mpeInE;
      margin = calc.margin;
    } else if (session.test_type === 'eccentricity') {
      const centerValue = activeMeasurements.length === 0 ? value :
        activeMeasurements[0].indicated_value;
      const deviation = activeMeasurements.length === 0 ? 0 : value - centerValue;
      const deviationInE = deviation / config.verification_interval;
      const loadInE = eccLoad / config.verification_interval;
      mpeInE = getMPE(config.accuracy_class, loadInE);
      mpe = mpeInE * config.verification_interval;
      error = deviation;
      errorInE = deviationInE;
      result = Math.abs(deviationInE) <= mpeInE ? 'pass' : 'fail';
      margin = mpeInE - Math.abs(deviationInE);
      formula = `ΔE = Indicated − Center Indication = ${value} − ${centerValue} = ${deviation.toFixed(4)} ${config.unit} (${deviationInE.toFixed(2)}e)`;
      reason = result === 'pass'
        ? `Deviation at ${ECCENTRICITY_POSITIONS[activeMeasurements.length]?.label || 'position'} (${deviationInE.toFixed(2)}e) is within MPE (±${mpeInE}e). Margin: ${margin.toFixed(2)}e.`
        : `Deviation at ${ECCENTRICITY_POSITIONS[activeMeasurements.length]?.label || 'position'} (${deviationInE.toFixed(2)}e) exceeds MPE (±${mpeInE}e) by ${Math.abs(deviationInE - mpeInE).toFixed(2)}e.`;
    } else {
      // Repeatability — individual reading (overall result computed at completion)
      error = value - repLoad;
      mpe = 0; // Will be computed at completion
      result = 'pass';
      formula = `Reading #${activeMeasurements.length + 1}: ${value} ${config.unit}`;
      reason = 'Reading recorded for statistical variance evaluation.';
    }

    const posLabel = session.test_type === 'eccentricity'
      ? ECCENTRICITY_POSITIONS[activeMeasurements.length]?.id || 'unknown'
      : undefined;

    store.addMeasurement(sessionId!, activeAttempt.id, {
      attempt_id: activeAttempt.id,
      measurement_number: activeMeasurements.length + 1,
      reference_load: session.test_type === 'accuracy' ? currentLoad! : session.test_type === 'eccentricity' ? eccLoad : repLoad,
      indicated_value: value,
      load_condition: loadCondition,
      error,
      mpe,
      result,
      reason,
      unit: config.unit,
      position: posLabel,
      observation,
    });

    setLastCalc({ error, mpe, result, reason, formula, errorInE, mpeInE, margin });
    setIndicatedValue('');
    setDeltaL('');
    setObservation('');
  };

  const handleCompleteTest = () => {
    let overallResult: TestResult = 'pass';
    let overallReason = '';

    // Get fresh measurements from store
    const freshSession = store.testSessions.find(s => s.id === sessionId);
    const freshAttempt = freshSession?.attempts[freshSession.attempts.length - 1];

    if (session.test_type === 'repeatability' && freshAttempt) {
      const readings = freshAttempt.measurements.map(m => m.indicated_value);
      if (readings.length >= 2) {
        const repResult = calculateRepeatability(
          { readings, referenceLoad: repLoad },
          config.accuracy_class,
          config.verification_interval
        );
        overallResult = repResult.result;
        overallReason = repResult.reason;
      }
    } else if (freshAttempt) {
      const hasFail = freshAttempt.measurements.some(m => m.result === 'fail');
      overallResult = hasFail ? 'fail' : 'pass';
      overallReason = hasFail
        ? 'One or more measurements exceed the applicable MPE.'
        : 'All measurements are within the applicable MPE.';
    }

    store.completeAttempt(sessionId!, freshAttempt?.id || activeAttempt.id, overallResult, overallReason);
    setShowComplete(true);
  };

  const handleRetest = () => {
    store.createRetestAttempt(sessionId!);
    setShowComplete(false);
    setLastCalc(null);
  };

  // Progress steps for the overall test plan
  const planTests = testPlan?.tests || [];
  const currentTestIdx = planTests.findIndex(t => t.test_type === session.test_type);

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate(`/instruments/${instrument.id}`)} style={{ marginBottom: 12 }}>
        <ArrowLeft size={14} /> Back to {instrument.instrument_id}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Left: Progress Steps */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 24 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Test Progress</div>
            <div className="test-progress-steps">
              <div className="test-step">
                <div className="test-step-indicator complete"><Check size={10} /></div>
                <div className="test-step-content"><div className="test-step-name">Registration</div></div>
              </div>
              <div className="test-step">
                <div className="test-step-indicator complete"><Check size={10} /></div>
                <div className="test-step-content"><div className="test-step-name">Configuration</div></div>
              </div>
              <div className="test-step">
                <div className="test-step-indicator complete"><Check size={10} /></div>
                <div className="test-step-content"><div className="test-step-name">Test Plan</div></div>
              </div>
              {planTests.map((t, i) => {
                const sess = store.testSessions.filter(s => s.instrument_id === instrument.id).find(s => s.test_type === t.test_type);
                const stepClass = t.test_type === session.test_type && !showComplete ? 'active' :
                  (t.status === 'pass' || (sess?.result === 'pass')) ? 'complete' :
                  (t.status === 'fail' || (sess?.result === 'fail')) ? 'fail' : 'pending';
                return (
                  <div key={i} className={`test-step ${stepClass}`}>
                    <div className={`test-step-indicator ${stepClass}`}>
                      {stepClass === 'complete' ? <Check size={10} /> : stepClass === 'fail' ? <XIcon size={8} /> : String(i + 4).padStart(2, '0')}
                    </div>
                    <div className="test-step-content">
                      <div className="test-step-name">{t.name}</div>
                    </div>
                  </div>
                );
              })}
              <div className="test-step">
                <div className="test-step-indicator pending">{String(planTests.length + 4).padStart(2, '0')}</div>
                <div className="test-step-content"><div className="test-step-name">Compliance</div></div>
              </div>
              <div className="test-step">
                <div className="test-step-indicator pending">{String(planTests.length + 5).padStart(2, '0')}</div>
                <div className="test-step-content"><div className="test-step-name">Report</div></div>
              </div>
            </div>

            <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 10, color: 'var(--steel)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Attempt History</div>
                {session.attempts.length > 1 && (
                  <span style={{ fontSize: 9, color: 'var(--amber)', background: 'var(--amber-dim)', padding: '1px 6px', borderRadius: 2 }}>
                    Retest Active
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {session.attempts.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAttemptIndex(i)}
                    style={{
                      padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      border: safeAttemptIdx === i ? '2px solid var(--pure-white)' : '1px solid var(--border)',
                      background: a.result === 'pass' ? 'var(--green-dim)' : a.result === 'fail' ? 'var(--red-dim)' : 'var(--amber-dim)',
                      color: a.result === 'pass' ? 'var(--green)' : a.result === 'fail' ? 'var(--red)' : 'var(--amber)',
                    }}
                  >
                    #{i + 1} {a.result !== 'in_progress' ? a.result.toUpperCase() : 'ACTIVE'}
                    {safeAttemptIdx === i ? ' ✓' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Test Area */}
        <div>
          <div className="card animate-in" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--steel)', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Test {String(currentTestIdx + 1).padStart(2, '0')} / {String(planTests.length).padStart(2, '0')}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--pure-white)', textTransform: 'capitalize', margin: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {session.test_type} Test
                  {!isViewingActiveAttempt && (
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 3, background: 'var(--charcoal)', color: 'var(--steel-light)' }}>
                      Viewing Attempt #{viewingAttempt.attempt_number} (Read Only)
                    </span>
                  )}
                </h2>
                <div style={{ fontSize: 11, color: 'var(--steel-light)' }}>
                  Attempt #{viewingAttempt.attempt_number} of {session.attempts.length} · Operator: {viewingAttempt.operator_name}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="progress-bar" style={{ width: 120 }}>
                  <div className="progress-bar-fill" style={{ width: `${session.progress}%` }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--steel-light)' }}>{session.progress}%</span>
              </div>
            </div>

            {/* If viewing historical attempt */}
            {!isViewingActiveAttempt && (
              <div style={{ padding: 12, background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 4, marginBottom: 16, fontSize: 12, color: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong>Viewing Historical Attempt #{viewingAttempt.attempt_number}:</strong> Recorded {viewingAttempt.measurements.length} readings with final status <strong>{viewingAttempt.result.toUpperCase()}</strong>.
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setSelectedAttemptIndex(session.attempts.length - 1)}
                >
                  Return to Active Attempt #{activeAttempt.attempt_number}
                </button>
              </div>
            )}

            {/* Instruction */}
            {isViewingActiveAttempt && (
              <div style={{
                padding: 12, background: 'var(--navy-mid)', border: '1px solid var(--border)',
                borderRadius: 4, marginBottom: 16, fontSize: 12, color: 'var(--off-white)',
                lineHeight: 1.6, borderLeft: '3px solid var(--amber)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--amber)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  Metrological Instruction
                </div>
                {getInstruction()}
              </div>
            )}

            {/* Input Form */}
            {isViewingActiveAttempt && !isComplete && session.status !== 'completed' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">
                    Reference Test Load (L)
                  </label>
                  <div className="form-input" style={{ background: 'var(--navy-mid)', fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
                    {session.test_type === 'accuracy' ? (currentLoad ?? '—') :
                     session.test_type === 'eccentricity' ? eccLoad : repLoad} {config.unit}
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Indicated Scale Value (I) <span className="required">*</span>
                    </label>
                    {/* Quick simulation buttons for testing */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ fontSize: 10, padding: '2px 6px', color: 'var(--green)', cursor: 'pointer', borderRadius: 2 }}
                        title="Auto-fill nominal compliant value"
                        onClick={() => {
                          const nominal = currentLoad!;
                          const e = config.verification_interval;
                          const smallErr = Math.round((Math.random() * 0.3 - 0.15) * e * 1000) / 1000;
                          setIndicatedValue((nominal + smallErr).toFixed(Math.max(2, String(e).split('.')[1]?.length || 2)));
                        }}
                      >
                        ⚡ Nominal
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ fontSize: 10, padding: '2px 6px', color: 'var(--red)', cursor: 'pointer', borderRadius: 2 }}
                        title="Auto-fill value that exceeds MPE to demonstrate failure detection"
                        onClick={() => {
                          const nominal = currentLoad!;
                          const e = config.verification_interval;
                          const failErr = (nominal <= config.max_capacity * 0.5 ? 2.2 : 3.2) * e;
                          setIndicatedValue((nominal + failErr).toFixed(Math.max(2, String(e).split('.')[1]?.length || 2)));
                        }}
                      >
                        ⚠️ Fail Test
                      </button>
                    </div>
                  </div>
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    value={indicatedValue}
                    onChange={e => setIndicatedValue(e.target.value)}
                    placeholder={`Enter value in ${config.unit}`}
                    autoFocus
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                {session.test_type === 'accuracy' && (
                  <div className="form-group">
                    <label className="form-label">Load Condition</label>
                    <select className="form-select" value={loadCondition} onChange={e => setLoadCondition(e.target.value as LoadCondition)}>
                      <option value="increasing">Increasing (Loading)</option>
                      <option value="decreasing">Decreasing (Unloading)</option>
                    </select>
                  </div>
                )}

                {session.test_type === 'eccentricity' && (
                  <div className="form-group">
                    <label className="form-label">Position</label>
                    <div className="form-input" style={{ background: 'var(--navy-mid)', textTransform: 'capitalize' }}>
                      {ECCENTRICITY_POSITIONS[activeMeasurements.length]?.label || 'Done'}
                    </div>
                  </div>
                )}

                {/* Turning Point Method Toggle */}
                {session.test_type === 'accuracy' && (
                  <div style={{ gridColumn: '1 / -1', padding: '8px 12px', background: 'var(--navy-mid)', borderRadius: 4, border: '1px solid var(--border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 11, color: 'var(--off-white)', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={useTurningPoint}
                        onChange={e => setUseTurningPoint(e.target.checked)}
                      />
                      <span>Enable Turning Point (Changeover) Method per R-76 §A.4.4.3 (uses additional small weights ΔL)</span>
                    </label>
                    {useTurningPoint && (
                      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="form-label">Additional Load (ΔL in {config.unit})</label>
                          <input
                            className="form-input"
                            type="number"
                            step="any"
                            value={deltaL}
                            onChange={e => setDeltaL(e.target.value)}
                            placeholder={`e.g. ${(config.verification_interval * 0.4).toFixed(4)}`}
                            style={{ fontFamily: 'var(--font-mono)' }}
                          />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--steel-light)', display: 'flex', alignItems: 'center' }}>
                          Turning point formula: <strong>E = I + ½d − ΔL − L</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Formula Preview */}
                {indicatedValue && !isNaN(parseFloat(indicatedValue)) && (
                  <div style={{ gridColumn: '1 / -1', padding: '8px 12px', background: 'rgba(232, 133, 12, 0.08)', border: '1px solid rgba(232, 133, 12, 0.25)', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--off-white)' }}>
                    <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Calculation Preview: </span>
                    {useTurningPoint && deltaL && !isNaN(parseFloat(deltaL))
                      ? `E = ${indicatedValue} + ${(0.5 * config.verification_interval).toFixed(4)} − ${deltaL} − ${currentLoad} = ${(parseFloat(indicatedValue) + 0.5 * config.verification_interval - parseFloat(deltaL) - currentLoad!).toFixed(4)} ${config.unit}`
                      : `E = I − L = ${indicatedValue} − ${currentLoad} = ${(parseFloat(indicatedValue) - currentLoad!).toFixed(4)} ${config.unit}`
                    }
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observation Notes (Optional)</label>
                  <textarea
                    className="form-textarea"
                    value={observation}
                    onChange={e => setObservation(e.target.value)}
                    placeholder="Environmental disturbances, leveling status, or operational observations…"
                    rows={2}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleRecordMeasurement}
                    disabled={!indicatedValue || isNaN(parseFloat(indicatedValue))}
                  >
                    <Save size={14} /> Record & Evaluate Measurement
                  </button>
                </div>
              </div>
            )}

            {/* Complete Actions */}
            {isViewingActiveAttempt && isComplete && session.status !== 'completed' && !showComplete && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-success btn-lg" onClick={handleCompleteTest}>
                  <CheckCircle2 size={16} /> Complete Evaluation & Save Test
                </button>
              </div>
            )}
          </div>

          {/* Last Calculation Result */}
          {lastCalc && session.test_type !== 'repeatability' && (
            <div className="animate-in" style={{ marginBottom: 16 }}>
              <ResultDisplay result={lastCalc.result} reason={lastCalc.reason} formula={lastCalc.formula} />
              <MPEVisualization error={lastCalc.error} mpe={lastCalc.mpe} result={lastCalc.result} />
            </div>
          )}

          {/* Completion */}
          {showComplete && (
            <div className="card animate-in" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--pure-white)' }}>Test Completed</h3>
              {(() => {
                const freshSess = store.testSessions.find(s => s.id === sessionId);
                const lastAttempt = freshSess?.attempts[freshSess.attempts.length - 1];
                return lastAttempt ? (
                  <>
                    <ResultDisplay result={lastAttempt.result} reason={lastAttempt.reason || ''} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      {lastAttempt.result === 'fail' && (
                        <button className="btn btn-secondary" onClick={handleRetest}>
                          <RotateCcw size={14} /> Retest
                        </button>
                      )}
                      <button className="btn btn-primary" onClick={() => navigate(`/instruments/${instrument.id}`)}>
                        Back to Instrument <ChevronRight size={14} />
                      </button>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}

          {/* Recorded Measurements Table */}
          {measurements.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>
                Recorded Measurements — Attempt #{viewingAttempt.attempt_number} ({measurements.length})
              </div>
              <table className="data-table" style={{ fontSize: 11 }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reference</th>
                    <th>Indicated</th>
                    {session.test_type === 'eccentricity' && <th>Position</th>}
                    {session.test_type !== 'repeatability' && <th>Error</th>}
                    {session.test_type !== 'repeatability' && <th>MPE</th>}
                    {session.test_type !== 'repeatability' && <th>Result</th>}
                    {session.test_type === 'accuracy' && <th>Condition</th>}
                  </tr>
                </thead>
                <tbody>
                  {measurements.map(m => (
                    <tr key={m.id}>
                      <td>{m.measurement_number}</td>
                      <td className="mono">{m.reference_load} {m.unit}</td>
                      <td className="mono">{m.indicated_value} {m.unit}</td>
                      {session.test_type === 'eccentricity' && <td style={{ textTransform: 'capitalize' }}>{m.position?.replace('-', ' ')}</td>}
                      {session.test_type !== 'repeatability' && (
                        <td className="mono" style={{ color: m.result === 'pass' ? 'var(--green)' : 'var(--red)' }}>
                          {m.error >= 0 ? '+' : ''}{m.error.toFixed(4)}
                        </td>
                      )}
                      {session.test_type !== 'repeatability' && (
                        <td className="mono">±{m.mpe.toFixed(4)}</td>
                      )}
                      {session.test_type !== 'repeatability' && (
                        <td><span className={`status-badge ${m.result}`}>{m.result}</span></td>
                      )}
                      {session.test_type === 'accuracy' && (
                        <td style={{ textTransform: 'capitalize', fontSize: 10, color: 'var(--steel-light)' }}>{m.load_condition}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
