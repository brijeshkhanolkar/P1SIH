// ============================================================
// DEMO DATA — Realistic sample instruments and test data
// ============================================================

import type {
  Instrument, InstrumentConfiguration, TestPlan, TestSession,
  TestAttempt, TestMeasurement, AuditLog, Evidence, Report,
  DashboardMetrics, Notification, User, R76RuleVersion, ComplianceSummary,
} from '../types';
import { createDefaultRuleVersion, generateTestLoads, calculateError, calculateRepeatability, calculateEccentricity, getEccentricityLoad, ECCENTRICITY_POSITIONS } from './r76-engine';

const now = new Date().toISOString();
const today = new Date();
const daysAgo = (d: number) => new Date(today.getTime() - d * 86400000).toISOString();

// -------------------------------------------------------
// USERS
// -------------------------------------------------------
export const DEMO_USERS: User[] = [
  {
    id: 'user-001',
    email: 'admin@metrology.gov.in',
    full_name: 'Dr. R. Krishnamurthy',
    role: 'admin',
    created_at: daysAgo(365),
    last_login: now,
    is_active: true,
  },
  {
    id: 'user-002',
    email: 'a.sharma@metrology.gov.in',
    full_name: 'A. Sharma',
    role: 'operator',
    created_at: daysAgo(180),
    last_login: daysAgo(0),
    is_active: true,
  },
  {
    id: 'user-003',
    email: 'p.reddy@metrology.gov.in',
    full_name: 'P. Reddy',
    role: 'reviewer',
    created_at: daysAgo(120),
    last_login: daysAgo(1),
    is_active: true,
  },
  {
    id: 'user-004',
    email: 'auditor@oiml.org',
    full_name: 'S. Gupta',
    role: 'auditor',
    created_at: daysAgo(60),
    last_login: daysAgo(3),
    is_active: true,
  },
];

// -------------------------------------------------------
// RULE VERSIONS
// -------------------------------------------------------
export const DEMO_RULE_VERSIONS: R76RuleVersion[] = [createDefaultRuleVersion()];

// -------------------------------------------------------
// INSTRUMENTS
// -------------------------------------------------------
export const DEMO_INSTRUMENTS: Instrument[] = [
  {
    id: 'inst-001',
    instrument_id: 'W-2026-001',
    manufacturer: 'Mettler Toledo',
    model: 'XPR10002S',
    serial_number: 'MT-20260115-A',
    instrument_type: 'Electronic Platform Scale',
    accuracy_class: 'III',
    max_capacity: 10000,
    verification_interval: 5,
    num_verification_intervals: 2000,
    min_capacity: 100,
    unit: 'g',
    location: 'Lab A — Room 101',
    manufacturer_details: 'Mettler Toledo GmbH, Greifensee, Switzerland',
    owner_organization: 'National Metrology Laboratory',
    date_received: daysAgo(30),
    status: 'compliant',
    created_by: 'user-002',
    created_at: daysAgo(30),
    updated_at: daysAgo(2),
  },
  {
    id: 'inst-002',
    instrument_id: 'W-2026-002',
    manufacturer: 'Sartorius',
    model: 'Cubis II MCA',
    serial_number: 'SAR-20260203-B',
    instrument_type: 'Precision Balance',
    accuracy_class: 'II',
    max_capacity: 5200,
    verification_interval: 0.01,
    num_verification_intervals: 520000,
    min_capacity: 10,
    unit: 'g',
    location: 'Lab B — Room 203',
    manufacturer_details: 'Sartorius AG, Göttingen, Germany',
    owner_organization: 'National Metrology Laboratory',
    date_received: daysAgo(21),
    status: 'under_test',
    created_by: 'user-002',
    created_at: daysAgo(21),
    updated_at: daysAgo(0),
  },
  {
    id: 'inst-003',
    instrument_id: 'W-2026-003',
    manufacturer: 'Essae Teraoka',
    model: 'DS-852',
    serial_number: 'ET-20260310-C',
    instrument_type: 'Counter Scale',
    accuracy_class: 'III',
    max_capacity: 30000,
    verification_interval: 10,
    num_verification_intervals: 3000,
    min_capacity: 200,
    unit: 'g',
    location: 'Lab A — Room 102',
    manufacturer_details: 'Essae Teraoka Pvt Ltd, Bengaluru, India',
    owner_organization: 'State Weights & Measures',
    date_received: daysAgo(14),
    status: 'non_compliant',
    created_by: 'user-002',
    created_at: daysAgo(14),
    updated_at: daysAgo(1),
  },
  {
    id: 'inst-004',
    instrument_id: 'W-2026-004',
    manufacturer: 'Kern & Sohn',
    model: 'FKB 36K0.1',
    serial_number: 'KS-20260422-D',
    instrument_type: 'Industrial Platform Scale',
    accuracy_class: 'III',
    max_capacity: 36000,
    verification_interval: 10,
    num_verification_intervals: 3600,
    min_capacity: 400,
    unit: 'g',
    location: 'Lab C — Warehouse',
    manufacturer_details: 'Kern & Sohn GmbH, Balingen, Germany',
    owner_organization: 'National Metrology Laboratory',
    date_received: daysAgo(7),
    status: 'configured',
    created_by: 'user-002',
    created_at: daysAgo(7),
    updated_at: daysAgo(5),
  },
  {
    id: 'inst-005',
    instrument_id: 'W-2026-005',
    manufacturer: 'Ohaus',
    model: 'Ranger 7000',
    serial_number: 'OH-20260501-E',
    instrument_type: 'Bench Scale',
    accuracy_class: 'III',
    max_capacity: 15000,
    verification_interval: 5,
    num_verification_intervals: 3000,
    min_capacity: 100,
    unit: 'g',
    location: 'Lab A — Room 101',
    manufacturer_details: 'Ohaus Corporation, Parsippany, NJ, USA',
    owner_organization: 'National Metrology Laboratory',
    date_received: daysAgo(3),
    status: 'registered',
    created_by: 'user-002',
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
];

// -------------------------------------------------------
// CONFIGURATIONS
// -------------------------------------------------------
export const DEMO_CONFIGURATIONS: InstrumentConfiguration[] = DEMO_INSTRUMENTS
  .filter(i => i.status !== 'draft' && i.status !== 'registered')
  .map(i => ({
    id: `config-${i.id}`,
    instrument_id: i.id,
    accuracy_class: i.accuracy_class,
    max_capacity: i.max_capacity,
    verification_interval: i.verification_interval,
    num_verification_intervals: i.num_verification_intervals,
    min_capacity: i.min_capacity,
    unit: i.unit,
    rule_version_id: 'r76-v1',
    is_valid: true,
    validation_errors: [],
    configured_by: 'user-002',
    configured_at: daysAgo(i.status === 'compliant' ? 28 : 5),
  }));

// -------------------------------------------------------
// TEST PLANS
// -------------------------------------------------------
export const DEMO_TEST_PLANS: TestPlan[] = [
  {
    id: 'plan-001',
    instrument_id: 'inst-001',
    rule_version_id: 'r76-v1',
    tests: [
      { test_type: 'accuracy', name: 'Accuracy Test', sequence: 1, status: 'pass', estimated_duration_minutes: 30, required_measurements: 8, is_mandatory: true },
      { test_type: 'eccentricity', name: 'Eccentricity Test', sequence: 2, status: 'pass', estimated_duration_minutes: 20, required_measurements: 5, is_mandatory: true },
      { test_type: 'repeatability', name: 'Repeatability Test', sequence: 3, status: 'pass', estimated_duration_minutes: 15, required_measurements: 10, is_mandatory: true },
    ],
    generated_by: 'user-002',
    generated_at: daysAgo(28),
    status: 'completed',
  },
  {
    id: 'plan-002',
    instrument_id: 'inst-002',
    rule_version_id: 'r76-v1',
    tests: [
      { test_type: 'accuracy', name: 'Accuracy Test', sequence: 1, status: 'in_progress', estimated_duration_minutes: 30, required_measurements: 8, is_mandatory: true },
      { test_type: 'eccentricity', name: 'Eccentricity Test', sequence: 2, status: 'pending', estimated_duration_minutes: 20, required_measurements: 5, is_mandatory: true },
      { test_type: 'repeatability', name: 'Repeatability Test', sequence: 3, status: 'pending', estimated_duration_minutes: 15, required_measurements: 10, is_mandatory: true },
    ],
    generated_by: 'user-002',
    generated_at: daysAgo(5),
    status: 'active',
  },
  {
    id: 'plan-003',
    instrument_id: 'inst-003',
    rule_version_id: 'r76-v1',
    tests: [
      { test_type: 'accuracy', name: 'Accuracy Test', sequence: 1, status: 'fail', estimated_duration_minutes: 30, required_measurements: 8, is_mandatory: true },
      { test_type: 'eccentricity', name: 'Eccentricity Test', sequence: 2, status: 'fail', estimated_duration_minutes: 20, required_measurements: 5, is_mandatory: true },
      { test_type: 'repeatability', name: 'Repeatability Test', sequence: 3, status: 'pass', estimated_duration_minutes: 15, required_measurements: 10, is_mandatory: true },
    ],
    generated_by: 'user-002',
    generated_at: daysAgo(12),
    status: 'completed',
  },
];

// -------------------------------------------------------
// TEST SESSIONS — build realistic measurement data
// -------------------------------------------------------
function buildAccuracySession(
  inst: Instrument,
  planId: string,
  status: 'completed' | 'in_progress',
  makePass: boolean,
  startDay: number
): TestSession {
  const loads = generateTestLoads(inst.max_capacity, inst.min_capacity, inst.verification_interval, inst.accuracy_class);
  const measurements: TestMeasurement[] = [];
  let allPass = true;

  const limitIdx = status === 'in_progress' ? Math.floor(loads.length * 0.7) : loads.length;

  for (let i = 0; i < limitIdx; i++) {
    const ref = loads[i];
    // Generate realistic indicated values
    const errorMultiplier = makePass ? 0.3 : (i === Math.floor(loads.length / 2) ? 2.5 : 0.3);
    const randomError = (Math.random() - 0.5) * errorMultiplier * inst.verification_interval;
    const indicated = ref + randomError;

    const calcResult = calculateError(
      { indicatedValue: Number(indicated.toFixed(4)), referenceLoad: ref },
      inst.accuracy_class,
      inst.verification_interval
    );

    if (calcResult.result === 'fail') allPass = false;

    measurements.push({
      id: `meas-${inst.id}-acc-${i}`,
      attempt_id: `attempt-${inst.id}-acc-1`,
      measurement_number: i + 1,
      reference_load: ref,
      indicated_value: Number(indicated.toFixed(4)),
      load_condition: 'increasing',
      error: calcResult.error,
      mpe: calcResult.mpe,
      result: calcResult.result,
      reason: calcResult.reason,
      unit: inst.unit,
      recorded_at: daysAgo(startDay),
      recorded_by: 'user-002',
    });
  }

  const attempt: TestAttempt = {
    id: `attempt-${inst.id}-acc-1`,
    session_id: `session-${inst.id}-acc`,
    attempt_number: 1,
    measurements,
    result: allPass && status === 'completed' ? 'pass' : status === 'completed' ? 'fail' : 'in_progress',
    reason: allPass && status === 'completed' ? 'All measurements within MPE.' : status === 'completed' ? 'One or more measurements exceed MPE.' : undefined,
    started_at: daysAgo(startDay),
    completed_at: status === 'completed' ? daysAgo(startDay) : undefined,
    operator_id: 'user-002',
    operator_name: 'A. Sharma',
  };

  const sessionResult = status === 'completed' ? (allPass ? 'pass' as const : 'fail' as const) : 'in_progress' as const;

  return {
    id: `session-${inst.id}-acc`,
    test_plan_id: planId,
    instrument_id: inst.id,
    test_type: 'accuracy',
    status: status,
    operator_id: 'user-002',
    operator_name: 'A. Sharma',
    started_at: daysAgo(startDay),
    completed_at: status === 'completed' ? daysAgo(startDay) : undefined,
    current_step: status === 'in_progress' ? limitIdx + 1 : measurements.length + 1,
    total_steps: loads.length + 2,
    progress: status === 'completed' ? 100 : Math.round((limitIdx / loads.length) * 100),
    attempts: [attempt],
    result: sessionResult,
  };
}

function buildEccentricitySession(
  inst: Instrument,
  planId: string,
  makePass: boolean,
  startDay: number
): TestSession {
  const eccLoad = getEccentricityLoad(inst.max_capacity);
  const centerValue = eccLoad + (Math.random() - 0.5) * 0.2 * inst.verification_interval;

  const positions = ECCENTRICITY_POSITIONS.map((pos, i) => {
    const deviation = pos.id === 'center' ? 0 :
      (makePass ? (Math.random() - 0.5) * 0.5 : (i === 2 ? 2.5 : (Math.random() - 0.5) * 0.5)) * inst.verification_interval;
    return { position: pos.id, indicatedValue: Number((centerValue + deviation).toFixed(4)) };
  });

  const eccResult = calculateEccentricity(
    { positions, referenceLoad: eccLoad, centerIndication: Number(centerValue.toFixed(4)) },
    inst.accuracy_class,
    inst.verification_interval
  );

  const measurements: TestMeasurement[] = eccResult.positions.map((p, i) => ({
    id: `meas-${inst.id}-ecc-${i}`,
    attempt_id: `attempt-${inst.id}-ecc-1`,
    measurement_number: i + 1,
    reference_load: eccLoad,
    indicated_value: p.indicatedValue,
    load_condition: 'increasing' as const,
    error: p.error,
    mpe: p.mpe,
    result: p.result,
    reason: p.reason,
    unit: inst.unit,
    position: p.position,
    recorded_at: daysAgo(startDay),
    recorded_by: 'user-002',
  }));

  const attempt: TestAttempt = {
    id: `attempt-${inst.id}-ecc-1`,
    session_id: `session-${inst.id}-ecc`,
    attempt_number: 1,
    measurements,
    result: eccResult.overallResult,
    reason: eccResult.overallResult === 'pass'
      ? 'All eccentric positions within MPE.'
      : `Maximum deviation at ${eccResult.maxErrorPosition} exceeds MPE.`,
    started_at: daysAgo(startDay),
    completed_at: daysAgo(startDay),
    operator_id: 'user-002',
    operator_name: 'A. Sharma',
  };

  return {
    id: `session-${inst.id}-ecc`,
    test_plan_id: planId,
    instrument_id: inst.id,
    test_type: 'eccentricity',
    status: 'completed',
    operator_id: 'user-002',
    operator_name: 'A. Sharma',
    started_at: daysAgo(startDay),
    completed_at: daysAgo(startDay),
    current_step: 6,
    total_steps: 6,
    progress: 100,
    attempts: [attempt],
    result: eccResult.overallResult,
  };
}

function buildRepeatabilitySession(
  inst: Instrument,
  planId: string,
  makePass: boolean,
  startDay: number
): TestSession {
  const repLoad = Math.round(inst.max_capacity * 0.5 / inst.verification_interval) * inst.verification_interval;
  const readings: number[] = [];

  for (let i = 0; i < 10; i++) {
    const spread = makePass ? 0.3 : 2.0;
    const reading = repLoad + (Math.random() - 0.5) * spread * inst.verification_interval;
    readings.push(Number(reading.toFixed(4)));
  }

  const repResult = calculateRepeatability(
    { readings, referenceLoad: repLoad },
    inst.accuracy_class,
    inst.verification_interval
  );

  const measurements: TestMeasurement[] = readings.map((r, i) => ({
    id: `meas-${inst.id}-rep-${i}`,
    attempt_id: `attempt-${inst.id}-rep-1`,
    measurement_number: i + 1,
    reference_load: repLoad,
    indicated_value: r,
    load_condition: 'increasing' as const,
    error: r - repLoad,
    mpe: repResult.mpe,
    result: 'pass' as const,
    reason: '',
    unit: inst.unit,
    recorded_at: daysAgo(startDay),
    recorded_by: 'user-002',
  }));

  const attempt: TestAttempt = {
    id: `attempt-${inst.id}-rep-1`,
    session_id: `session-${inst.id}-rep`,
    attempt_number: 1,
    measurements,
    result: repResult.result,
    reason: repResult.reason,
    started_at: daysAgo(startDay),
    completed_at: daysAgo(startDay),
    operator_id: 'user-002',
    operator_name: 'A. Sharma',
  };

  return {
    id: `session-${inst.id}-rep`,
    test_plan_id: planId,
    instrument_id: inst.id,
    test_type: 'repeatability',
    status: 'completed',
    operator_id: 'user-002',
    operator_name: 'A. Sharma',
    started_at: daysAgo(startDay),
    completed_at: daysAgo(startDay),
    current_step: 12,
    total_steps: 12,
    progress: 100,
    attempts: [attempt],
    result: repResult.result,
  };
}

// Build all sessions
export const DEMO_TEST_SESSIONS: TestSession[] = [
  // Instrument 1 — all pass (compliant)
  buildAccuracySession(DEMO_INSTRUMENTS[0], 'plan-001', 'completed', true, 26),
  buildEccentricitySession(DEMO_INSTRUMENTS[0], 'plan-001', true, 26),
  buildRepeatabilitySession(DEMO_INSTRUMENTS[0], 'plan-001', true, 26),
  // Instrument 2 — in progress
  buildAccuracySession(DEMO_INSTRUMENTS[1], 'plan-002', 'in_progress', false, 3),
  // Instrument 3 — fail
  buildAccuracySession(DEMO_INSTRUMENTS[2], 'plan-003', 'completed', false, 10),
  buildEccentricitySession(DEMO_INSTRUMENTS[2], 'plan-003', false, 10),
  buildRepeatabilitySession(DEMO_INSTRUMENTS[2], 'plan-003', true, 10),
];

// -------------------------------------------------------
// AUDIT LOGS
// -------------------------------------------------------
export const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'audit-001', timestamp: daysAgo(30), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Registered instrument', entity_type: 'instrument', entity_id: 'inst-001', details: 'Registered W-2026-001 (Mettler Toledo XPR10002S)' },
  { id: 'audit-002', timestamp: daysAgo(28), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Configured instrument', entity_type: 'instrument', entity_id: 'inst-001', details: 'Configuration validated: Class III, Max=10000g, e=5g' },
  { id: 'audit-003', timestamp: daysAgo(28), user_id: 'system', user_name: 'SYSTEM', user_role: 'admin', action: 'Generated test plan', entity_type: 'instrument', entity_id: 'inst-001', details: 'Test plan plan-001 generated with 3 tests' },
  { id: 'audit-004', timestamp: daysAgo(26), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Started accuracy test', entity_type: 'test_session', entity_id: 'session-inst-001-acc', details: 'Accuracy test started for W-2026-001' },
  { id: 'audit-005', timestamp: daysAgo(26), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Completed accuracy test', entity_type: 'test_session', entity_id: 'session-inst-001-acc', details: 'Accuracy test completed — PASS' },
  { id: 'audit-006', timestamp: daysAgo(26), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Completed eccentricity test', entity_type: 'test_session', entity_id: 'session-inst-001-ecc', details: 'Eccentricity test completed — PASS' },
  { id: 'audit-007', timestamp: daysAgo(26), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Completed repeatability test', entity_type: 'test_session', entity_id: 'session-inst-001-rep', details: 'Repeatability test completed — PASS' },
  { id: 'audit-008', timestamp: daysAgo(2), user_id: 'user-003', user_name: 'P. Reddy', user_role: 'reviewer', action: 'Reviewed compliance', entity_type: 'instrument', entity_id: 'inst-001', details: 'W-2026-001 marked as COMPLIANT' },
  { id: 'audit-009', timestamp: daysAgo(21), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Registered instrument', entity_type: 'instrument', entity_id: 'inst-002', details: 'Registered W-2026-002 (Sartorius Cubis II MCA)' },
  { id: 'audit-010', timestamp: daysAgo(14), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Registered instrument', entity_type: 'instrument', entity_id: 'inst-003', details: 'Registered W-2026-003 (Essae Teraoka DS-852)' },
  { id: 'audit-011', timestamp: daysAgo(10), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Completed accuracy test', entity_type: 'test_session', entity_id: 'session-inst-003-acc', details: 'Accuracy test completed — FAIL (error exceeds MPE at 15000g)' },
  { id: 'audit-012', timestamp: daysAgo(3), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Started accuracy test', entity_type: 'test_session', entity_id: 'session-inst-002-acc', details: 'Accuracy test started for W-2026-002' },
  { id: 'audit-013', timestamp: daysAgo(3), user_id: 'user-002', user_name: 'A. Sharma', user_role: 'operator', action: 'Recorded measurement', entity_type: 'measurement', entity_id: 'meas-inst-002-acc-0', details: 'Measurement recorded: 10.0001g at 10g reference load' },
];

// -------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------
export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', title: 'Test Requires Attention', message: 'Accuracy test for W-2026-002 has been paused for 2 hours.', type: 'warning', read: false, created_at: daysAgo(0), action_url: '/testing/session-inst-002-acc' },
  { id: 'notif-002', title: 'Compliance Review Complete', message: 'W-2026-001 has been reviewed and marked as COMPLIANT.', type: 'success', read: false, created_at: daysAgo(2) },
  { id: 'notif-003', title: 'Test Failed', message: 'Eccentricity test for W-2026-003 has failed. Retest recommended.', type: 'error', read: true, created_at: daysAgo(10) },
  { id: 'notif-004', title: 'New Instrument Registered', message: 'W-2026-005 (Ohaus Ranger 7000) registered by A. Sharma.', type: 'info', read: true, created_at: daysAgo(3) },
];

// -------------------------------------------------------
// DASHBOARD METRICS
// -------------------------------------------------------
export const DEMO_DASHBOARD_METRICS: DashboardMetrics = {
  registered_instruments: 5,
  instruments_change: 2,
  active_tests: 1,
  tests_requiring_attention: 1,
  tests_this_month: 7,
  pending_tests: 3,
  passed_tests: 5,
  failed_tests: 2,
  retests: 0,
  compliance_percentage: 91.4,
};

// -------------------------------------------------------
// REPORTS
// -------------------------------------------------------
export const DEMO_REPORTS: Report[] = [
  {
    id: 'report-001',
    report_number: 'RPT-2026-001',
    instrument_id: 'inst-001',
    report_type: 'standard',
    instrument: DEMO_INSTRUMENTS[0],
    configuration: DEMO_CONFIGURATIONS[0],
    test_sessions: DEMO_TEST_SESSIONS.filter(s => s.instrument_id === 'inst-001'),
    compliance_result: 'pass',
    compliance_summary: {
      overall_result: 'pass',
      tests: [
        { test_type: 'accuracy', test_name: 'Accuracy Test', result: 'pass', measurements_count: 8, passed_count: 8, failed_count: 0, max_error: 1.2, max_mpe: 2.5, attempts_count: 1 },
        { test_type: 'eccentricity', test_name: 'Eccentricity Test', result: 'pass', measurements_count: 5, passed_count: 5, failed_count: 0, max_error: 0.8, max_mpe: 2.5, attempts_count: 1 },
        { test_type: 'repeatability', test_name: 'Repeatability Test', result: 'pass', measurements_count: 10, passed_count: 10, failed_count: 0, max_error: 0.3, max_mpe: 2.5, attempts_count: 1 },
      ],
      total_measurements: 23,
      passed_measurements: 23,
      failed_measurements: 0,
      compliance_percentage: 100,
    },
    generated_by: 'user-002',
    generated_by_name: 'A. Sharma',
    generated_at: daysAgo(2),
    reviewed_by: 'user-003',
    reviewed_at: daysAgo(1),
    rule_version: 'OIML R-76-1 (2006) v1.0.0',
    organization_name: 'National Metrology Laboratory',
  },
];
