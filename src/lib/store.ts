// ============================================================
// ZUSTAND STORE — Central Application State
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  User, Instrument, InstrumentConfiguration, TestPlan, TestSession,
  TestAttempt, TestMeasurement, AuditLog, Evidence, Report,
  DashboardMetrics, Notification, R76RuleVersion, UserRole,
  AccuracyClass, InstrumentStatus, TestResult, TestType, FilterState,
  ComplianceSummary, ComplianceTestResult,
} from '../types';
import {
  DEMO_USERS, DEMO_INSTRUMENTS, DEMO_CONFIGURATIONS, DEMO_TEST_PLANS,
  DEMO_TEST_SESSIONS, DEMO_AUDIT_LOGS, DEMO_NOTIFICATIONS,
  DEMO_DASHBOARD_METRICS, DEMO_REPORTS, DEMO_RULE_VERSIONS,
} from './demo-data';
import {
  calculateError, generateTestLoads, createDefaultRuleVersion,
  getEccentricityLoad, ECCENTRICITY_POSITIONS,
} from './r76-engine';

// -------------------------------------------------------
// Store Interface
// -------------------------------------------------------
interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  resetToDefaults: () => void;

  // Users
  users: User[];

  // Instruments
  instruments: Instrument[];
  addInstrument: (data: Omit<Instrument, 'id' | 'instrument_id' | 'created_at' | 'updated_at' | 'num_verification_intervals'>) => Instrument;
  updateInstrument: (id: string, data: Partial<Instrument>) => void;
  getInstrument: (id: string) => Instrument | undefined;

  // Configurations
  configurations: InstrumentConfiguration[];
  saveConfiguration: (instrumentId: string, data: Partial<InstrumentConfiguration>) => InstrumentConfiguration;
  getConfiguration: (instrumentId: string) => InstrumentConfiguration | undefined;

  // Test Plans
  testPlans: TestPlan[];
  generateTestPlan: (instrumentId: string) => TestPlan;
  getTestPlan: (instrumentId: string) => TestPlan | undefined;

  // Test Sessions
  testSessions: TestSession[];
  startTestSession: (planId: string, testType: TestType) => TestSession;
  getTestSession: (id: string) => TestSession | undefined;
  getSessionsByInstrument: (instrumentId: string) => TestSession[];
  updateTestSession: (id: string, data: Partial<TestSession>) => void;

  // Measurements
  addMeasurement: (sessionId: string, attemptId: string, measurement: Omit<TestMeasurement, 'id' | 'recorded_at' | 'recorded_by'>) => TestMeasurement;

  // Attempts
  createRetestAttempt: (sessionId: string) => TestAttempt;
  completeAttempt: (sessionId: string, attemptId: string, result: TestResult, reason: string) => void;

  // Evidence
  evidence: Evidence[];
  addEvidence: (data: Omit<Evidence, 'id' | 'uploaded_at'>) => Evidence;
  getEvidenceForInstrument: (instrumentId: string) => Evidence[];

  // Reports
  reports: Report[];
  generateReport: (instrumentId: string, reportType: 'standard' | 'detailed' | 'retest') => Report;
  getReport: (id: string) => Report | undefined;
  getReportsForInstrument: (instrumentId: string) => Report[];
  approveReport: (reportId: string, notes?: string) => void;

  // Audit
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entityType: AuditLog['entity_type'], entityId: string, details: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;

  // R-76 Rules
  ruleVersions: R76RuleVersion[];
  activeRuleVersion: R76RuleVersion;

  // Dashboard
  dashboardMetrics: DashboardMetrics;
  recalculateMetrics: () => void;

  // Filters
  instrumentFilters: FilterState;
  setInstrumentFilters: (filters: Partial<FilterState>) => void;
}

// -------------------------------------------------------
// Helper: generate sequential instrument ID
// -------------------------------------------------------
function generateInstrumentId(instruments: Instrument[]): string {
  const year = new Date().getFullYear();
  const maxNum = instruments.reduce((max, inst) => {
    const match = inst.instrument_id.match(/W-\d{4}-(\d{3})/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `W-${year}-${String(maxNum + 1).padStart(3, '0')}`;
}

function generateReportNumber(reports: Report[]): string {
  const year = new Date().getFullYear();
  const maxNum = reports.reduce((max, r) => {
    const match = r.report_number.match(/RPT-\d{4}-(\d{3})/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `RPT-${year}-${String(maxNum + 1).padStart(3, '0')}`;
}

// -------------------------------------------------------
// Create Store
// -------------------------------------------------------
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Auth ---
      currentUser: null,
      isAuthenticated: false,

      login: (email: string, _password: string) => {
        const user = DEMO_USERS.find(u => u.email === email);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          get().addAuditLog('User logged in', 'user', user.id, `${user.full_name} logged in`);
          return true;
        }
        // Demo: any email works, default to operator
        const demoUser: User = {
          id: uuidv4(),
          email,
          full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role: 'operator',
          created_at: new Date().toISOString(),
          is_active: true,
        };
        set({ currentUser: demoUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        const user = get().currentUser;
        if (user) {
          get().addAuditLog('User logged out', 'user', user.id, `${user.full_name} logged out`);
        }
        set({ currentUser: null, isAuthenticated: false });
      },

      switchUserRole: (role: UserRole) => {
        const target = DEMO_USERS.find(u => u.role === role);
        if (target) {
          set({ currentUser: target, isAuthenticated: true });
          get().addAuditLog('Switched persona', 'user', target.id, `Active operator switched to ${target.full_name} (${role})`);
        }
      },

      resetToDefaults: () => {
        set({
          instruments: [...DEMO_INSTRUMENTS],
          configurations: [...DEMO_CONFIGURATIONS],
          testPlans: [...DEMO_TEST_PLANS],
          testSessions: [...DEMO_TEST_SESSIONS],
          evidence: [],
          reports: [...DEMO_REPORTS],
          auditLogs: [...DEMO_AUDIT_LOGS],
          notifications: [...DEMO_NOTIFICATIONS],
          ruleVersions: [...DEMO_RULE_VERSIONS],
          activeRuleVersion: DEMO_RULE_VERSIONS[0],
          dashboardMetrics: { ...DEMO_DASHBOARD_METRICS },
        });
        get().recalculateMetrics();
        get().addAuditLog('Reset laboratory data', 'system', 'system', 'Reset all instruments and test records to factory calibration state');
      },

      // --- Users ---
      users: [...DEMO_USERS],

      // --- Instruments ---
      instruments: [...DEMO_INSTRUMENTS],

      addInstrument: (data) => {
        const instruments = get().instruments;
        const instrumentId = generateInstrumentId(instruments);
        const n = Math.floor(data.max_capacity / data.verification_interval);
        const newInstrument: Instrument = {
          ...data,
          id: uuidv4(),
          instrument_id: instrumentId,
          num_verification_intervals: n,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        // Also auto-create a matching initial configuration so test plan generation is immediately ready
        const newConfig: InstrumentConfiguration = {
          id: uuidv4(),
          instrument_id: newInstrument.id,
          accuracy_class: newInstrument.accuracy_class,
          max_capacity: newInstrument.max_capacity,
          verification_interval: newInstrument.verification_interval,
          num_verification_intervals: n,
          min_capacity: newInstrument.min_capacity,
          unit: newInstrument.unit,
          rule_version_id: 'r76-v1',
          is_valid: true,
          validation_errors: [],
          configured_by: get().currentUser?.id || 'system',
          configured_at: new Date().toISOString(),
        };
        set(state => ({
          instruments: [...state.instruments, newInstrument],
          configurations: [...state.configurations, newConfig],
        }));
        get().addAuditLog(
          'Registered instrument',
          'instrument',
          newInstrument.id,
          `Registered ${instrumentId} (${data.manufacturer} ${data.model}) with auto-configuration`
        );
        get().recalculateMetrics();
        return newInstrument;
      },

  updateInstrument: (id, data) => {
    set(state => ({
      instruments: state.instruments.map(i =>
        i.id === id ? { ...i, ...data, updated_at: new Date().toISOString() } : i
      ),
    }));
    get().addAuditLog(
      'Updated instrument',
      'instrument',
      id,
      `Updated instrument ${get().instruments.find(i => i.id === id)?.instrument_id || id}`
    );
  },

  getInstrument: (id) => get().instruments.find(i => i.id === id),

  // --- Configurations ---
  configurations: [...DEMO_CONFIGURATIONS],

  saveConfiguration: (instrumentId, data) => {
    const configs = get().configurations;
    const existing = configs.find(c => c.instrument_id === instrumentId);
    const instrument = get().getInstrument(instrumentId);
    const n = data.max_capacity && data.verification_interval
      ? Math.floor(data.max_capacity / data.verification_interval)
      : existing?.num_verification_intervals || 0;

    const config: InstrumentConfiguration = {
      id: existing?.id || uuidv4(),
      instrument_id: instrumentId,
      accuracy_class: data.accuracy_class || instrument?.accuracy_class || 'III',
      max_capacity: data.max_capacity || instrument?.max_capacity || 0,
      verification_interval: data.verification_interval || instrument?.verification_interval || 0,
      num_verification_intervals: n,
      min_capacity: data.min_capacity || instrument?.min_capacity || 0,
      unit: data.unit || instrument?.unit || 'g',
      rule_version_id: data.rule_version_id || 'r76-v1',
      is_valid: true,
      validation_errors: [],
      configured_by: get().currentUser?.id || 'system',
      configured_at: new Date().toISOString(),
    };

    if (existing) {
      set({ configurations: configs.map(c => c.instrument_id === instrumentId ? config : c) });
    } else {
      set({ configurations: [...configs, config] });
    }

    // Update instrument status to configured
    get().updateInstrument(instrumentId, { status: 'configured' as InstrumentStatus });

    get().addAuditLog(
      'Configured instrument',
      'instrument',
      instrumentId,
      `Configuration validated: Class ${config.accuracy_class}, Max=${config.max_capacity}${config.unit}, e=${config.verification_interval}${config.unit}`
    );

    return config;
  },

  getConfiguration: (instrumentId) => get().configurations.find(c => c.instrument_id === instrumentId),

  // --- Test Plans ---
  testPlans: [...DEMO_TEST_PLANS],

  generateTestPlan: (instrumentId) => {
    const instrument = get().getInstrument(instrumentId);
    if (!instrument) throw new Error('Instrument not found');

    let config = get().getConfiguration(instrumentId);
    if (!config) {
      config = get().saveConfiguration(instrumentId, {
        accuracy_class: instrument.accuracy_class,
        max_capacity: instrument.max_capacity,
        verification_interval: instrument.verification_interval,
        num_verification_intervals: instrument.num_verification_intervals,
        min_capacity: instrument.min_capacity,
        unit: instrument.unit,
        rule_version_id: 'r76-v1',
      });
    }

    const ruleVersion = get().activeRuleVersion;
    const testLoads = generateTestLoads(
      config.max_capacity, config.min_capacity,
      config.verification_interval, config.accuracy_class
    );

    const plan: TestPlan = {
      id: uuidv4(),
      instrument_id: instrumentId,
      rule_version_id: ruleVersion.id,
      tests: ruleVersion.test_procedures.map((proc, i) => ({
        test_type: proc.test_type,
        name: proc.name,
        sequence: i + 1,
        status: 'pending' as TestResult,
        estimated_duration_minutes: proc.estimated_duration_minutes,
        required_measurements: proc.test_type === 'accuracy' ? testLoads.length * 2 : proc.required_measurements,
        is_mandatory: proc.is_mandatory,
      })),
      generated_by: get().currentUser?.id || 'system',
      generated_at: new Date().toISOString(),
      status: 'generated',
    };

    // Remove old plans for this instrument
    set(state => ({
      testPlans: [...state.testPlans.filter(p => p.instrument_id !== instrumentId), plan],
    }));

    get().addAuditLog(
      'Generated test plan',
      'instrument',
      instrumentId,
      `Test plan generated with ${plan.tests.length} tests for ${instrument.instrument_id}`
    );

    return plan;
  },

  getTestPlan: (instrumentId) => get().testPlans.find(p => p.instrument_id === instrumentId),

  // --- Test Sessions ---
  testSessions: [...DEMO_TEST_SESSIONS],

  startTestSession: (planId, testType) => {
    const plan = get().testPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Test plan not found');

    const instrument = get().getInstrument(plan.instrument_id);
    const config = get().getConfiguration(plan.instrument_id);
    if (!instrument || !config) throw new Error('Instrument not configured');

    const procedure = get().activeRuleVersion.test_procedures.find(p => p.test_type === testType);
    const totalSteps = testType === 'accuracy'
      ? generateTestLoads(config.max_capacity, config.min_capacity, config.verification_interval, config.accuracy_class).length + 2
      : testType === 'eccentricity' ? 7 : 12;

    const session: TestSession = {
      id: uuidv4(),
      test_plan_id: planId,
      instrument_id: plan.instrument_id,
      test_type: testType,
      status: 'in_progress',
      operator_id: get().currentUser?.id || 'user-002',
      operator_name: get().currentUser?.full_name || 'Operator',
      started_at: new Date().toISOString(),
      current_step: 1,
      total_steps: totalSteps,
      progress: 0,
      attempts: [{
        id: uuidv4(),
        session_id: '',
        attempt_number: 1,
        measurements: [],
        result: 'in_progress',
        started_at: new Date().toISOString(),
        operator_id: get().currentUser?.id || 'user-002',
        operator_name: get().currentUser?.full_name || 'Operator',
      }],
    };

    // Set attempt session_id
    session.attempts[0].session_id = session.id;

    set(state => ({ testSessions: [...state.testSessions, session] }));

    // Update plan status
    set(state => ({
      testPlans: state.testPlans.map(p => p.id === planId ? { ...p, status: 'active' as const } : p),
    }));

    // Update instrument status
    get().updateInstrument(plan.instrument_id, { status: 'under_test' });

    get().addAuditLog(
      `Started ${testType} test`,
      'test_session',
      session.id,
      `${procedure?.name || testType} started for ${instrument.instrument_id}`
    );

    return session;
  },

  getTestSession: (id) => get().testSessions.find(s => s.id === id),

  getSessionsByInstrument: (instrumentId) =>
    get().testSessions.filter(s => s.instrument_id === instrumentId),

  updateTestSession: (id, data) => {
    set(state => ({
      testSessions: state.testSessions.map(s => s.id === id ? { ...s, ...data } : s),
    }));
  },

  // --- Measurements ---
  addMeasurement: (sessionId, attemptId, measurement) => {
    const newMeasurement: TestMeasurement = {
      ...measurement,
      id: uuidv4(),
      recorded_at: new Date().toISOString(),
      recorded_by: get().currentUser?.id || 'user-002',
    };

    set(state => ({
      testSessions: state.testSessions.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          current_step: s.current_step + 1,
          progress: Math.min(100, Math.round(((s.current_step + 1) / s.total_steps) * 100)),
          attempts: s.attempts.map(a => {
            if (a.id !== attemptId) return a;
            return {
              ...a,
              measurements: [...a.measurements, newMeasurement],
            };
          }),
        };
      }),
    }));

    get().addAuditLog(
      'Recorded measurement',
      'measurement',
      newMeasurement.id,
      `Measurement recorded: ${measurement.indicated_value}${measurement.unit} at ${measurement.reference_load}${measurement.unit} reference load (Error: ${measurement.error.toFixed(4)})`
    );

    return newMeasurement;
  },

  // --- Attempts ---
  createRetestAttempt: (sessionId) => {
    const session = get().getTestSession(sessionId);
    if (!session) throw new Error('Session not found');

    const newAttempt: TestAttempt = {
      id: uuidv4(),
      session_id: sessionId,
      attempt_number: session.attempts.length + 1,
      measurements: [],
      result: 'in_progress',
      started_at: new Date().toISOString(),
      operator_id: get().currentUser?.id || 'user-002',
      operator_name: get().currentUser?.full_name || 'Operator',
    };

    set(state => ({
      testSessions: state.testSessions.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'in_progress' as const,
          progress: 0,
          current_step: 1,
          result: undefined,
          attempts: [...s.attempts, newAttempt],
        };
      }),
    }));

    get().addAuditLog(
      'Created retest attempt',
      'test_session',
      sessionId,
      `Retest attempt #${newAttempt.attempt_number} created`
    );

    return newAttempt;
  },

  completeAttempt: (sessionId, attemptId, result, reason) => {
    set(state => ({
      testSessions: state.testSessions.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
          progress: 100,
          result,
          attempts: s.attempts.map(a => {
            if (a.id !== attemptId) return a;
            return {
              ...a,
              result,
              reason,
              completed_at: new Date().toISOString(),
            };
          }),
        };
      }),
    }));

    // Update test plan item status
    const session = get().getTestSession(sessionId);
    if (session) {
      set(state => ({
        testPlans: state.testPlans.map(p => {
          if (p.id !== session.test_plan_id) return p;
          return {
            ...p,
            tests: p.tests.map(t =>
              t.test_type === session.test_type ? { ...t, status: result } : t
            ),
          };
        }),
      }));

      // Check if all tests are complete
      const plan = get().testPlans.find(p => p.id === session.test_plan_id);
      if (plan && plan.tests.every(t => t.status === 'pass' || t.status === 'fail')) {
        const allPass = plan.tests.every(t => t.status === 'pass');
        const instrument = get().getInstrument(session.instrument_id);
        get().updateInstrument(session.instrument_id, {
          status: allPass ? 'compliant' : 'non_compliant',
        });
        set(state => ({
          testPlans: state.testPlans.map(p =>
            p.id === session.test_plan_id ? { ...p, status: 'completed' as const } : p
          ),
        }));
      }
    }

    get().addAuditLog(
      `Completed test — ${result.toUpperCase()}`,
      'test_session',
      sessionId,
      `${session?.test_type} test completed with result: ${result}. ${reason}`
    );

    get().recalculateMetrics();
  },

  // --- Evidence ---
  evidence: [],

  addEvidence: (data) => {
    const newEvidence: Evidence = {
      ...data,
      id: uuidv4(),
      uploaded_at: new Date().toISOString(),
    };
    set(state => ({ evidence: [...state.evidence, newEvidence] }));
    get().addAuditLog(
      'Uploaded evidence',
      'evidence',
      newEvidence.id,
      `Evidence "${data.file_name}" uploaded for instrument`
    );
    return newEvidence;
  },

  getEvidenceForInstrument: (instrumentId) =>
    get().evidence.filter(e => e.instrument_id === instrumentId),

  // --- Reports ---
  reports: [...DEMO_REPORTS],

  generateReport: (instrumentId, reportType) => {
    const instrument = get().getInstrument(instrumentId);
    const config = get().getConfiguration(instrumentId);
    const sessions = get().getSessionsByInstrument(instrumentId);
    if (!instrument || !config) throw new Error('Instrument not configured');

    // Build compliance summary
    const testResults: ComplianceTestResult[] = sessions
      .filter(s => s.status === 'completed')
      .map(s => {
        const lastAttempt = s.attempts[s.attempts.length - 1];
        return {
          test_type: s.test_type,
          test_name: s.test_type.charAt(0).toUpperCase() + s.test_type.slice(1) + ' Test',
          result: lastAttempt.result === 'pass' ? 'pass' as const : 'fail' as const,
          measurements_count: lastAttempt.measurements.length,
          passed_count: lastAttempt.measurements.filter(m => m.result === 'pass').length,
          failed_count: lastAttempt.measurements.filter(m => m.result === 'fail').length,
          max_error: Math.max(...lastAttempt.measurements.map(m => Math.abs(m.error)), 0),
          max_mpe: lastAttempt.measurements[0]?.mpe || 0,
          attempts_count: s.attempts.length,
        };
      });

    const totalMeas = testResults.reduce((s, t) => s + t.measurements_count, 0);
    const passedMeas = testResults.reduce((s, t) => s + t.passed_count, 0);
    const failedMeas = testResults.reduce((s, t) => s + t.failed_count, 0);

    const summary: ComplianceSummary = {
      overall_result: testResults.every(t => t.result === 'pass') ? 'pass' : 'fail',
      tests: testResults,
      total_measurements: totalMeas,
      passed_measurements: passedMeas,
      failed_measurements: failedMeas,
      compliance_percentage: totalMeas > 0 ? Math.round((passedMeas / totalMeas) * 100 * 10) / 10 : 0,
    };

    const report: Report = {
      id: uuidv4(),
      report_number: generateReportNumber(get().reports),
      instrument_id: instrumentId,
      report_type: reportType,
      instrument,
      configuration: config,
      test_sessions: sessions,
      compliance_result: summary.overall_result,
      compliance_summary: summary,
      generated_by: get().currentUser?.id || 'user-002',
      generated_by_name: get().currentUser?.full_name || 'Operator',
      generated_at: new Date().toISOString(),
      rule_version: get().activeRuleVersion.name + ' v' + get().activeRuleVersion.version,
      organization_name: 'National Metrology Laboratory',
    };

    set(state => ({ reports: [...state.reports, report] }));
    get().addAuditLog(
      'Generated report',
      'report',
      report.id,
      `Report ${report.report_number} generated for ${instrument.instrument_id}`
    );

    return report;
  },

  getReport: (id) => get().reports.find(r => r.id === id),

  getReportsForInstrument: (instrumentId) =>
    get().reports.filter(r => r.instrument_id === instrumentId),

  approveReport: (reportId, notes) => {
    const user = get().currentUser;
    const reviewerName = user?.full_name || 'Authorized Reviewer';
    const hash = 'SHA256:' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    set(state => ({
      reports: state.reports.map(r => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          reviewed_by: user?.id || 'user-003',
          reviewed_by_name: reviewerName,
          reviewed_at: new Date().toISOString(),
          approval_status: 'approved',
          signature_hash: hash,
        };
      }),
    }));
    get().addAuditLog(
      'Approved report',
      'report',
      reportId,
      `Report approved and digitally signed by ${reviewerName} (${hash})${notes ? ` — Notes: ${notes}` : ''}`
    );
    get().addNotification({
      title: 'Report Approved',
      message: `Report has been approved and digitally signed by ${reviewerName}`,
      type: 'success',
      action_url: `/reports/${reportId}`,
    });
  },

  // --- Audit Logs ---
  auditLogs: [...DEMO_AUDIT_LOGS],

  addAuditLog: (action, entityType, entityId, details) => {
    const user = get().currentUser;
    const log: AuditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      user_id: user?.id || 'system',
      user_name: user?.full_name || 'SYSTEM',
      user_role: user?.role || 'admin',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    };
    set(state => ({ auditLogs: [log, ...state.auditLogs] }));
  },

  // --- Notifications ---
  notifications: [...DEMO_NOTIFICATIONS],

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  },

  addNotification: (notif) => {
    const n: Notification = {
      ...notif,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      read: false,
    };
    set(state => ({ notifications: [n, ...state.notifications] }));
  },

  // --- R-76 Rules ---
  ruleVersions: [...DEMO_RULE_VERSIONS],
  activeRuleVersion: DEMO_RULE_VERSIONS[0],

  // --- Dashboard ---
  dashboardMetrics: { ...DEMO_DASHBOARD_METRICS },

  recalculateMetrics: () => {
    const state = get();
    const instruments = state.instruments;
    const sessions = state.testSessions;
    const completedSessions = sessions.filter(s => s.status === 'completed');

    set({
      dashboardMetrics: {
        registered_instruments: instruments.length,
        instruments_change: instruments.filter(i => {
          const d = new Date(i.created_at);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
        active_tests: sessions.filter(s => s.status === 'in_progress').length,
        tests_requiring_attention: sessions.filter(s => s.status === 'paused').length +
          sessions.filter(s => s.status === 'in_progress' && s.progress < 50).length,
        tests_this_month: sessions.filter(s => {
          const d = new Date(s.started_at);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
        pending_tests: sessions.filter(s => s.status === 'planned').length,
        passed_tests: completedSessions.filter(s => s.result === 'pass').length,
        failed_tests: completedSessions.filter(s => s.result === 'fail').length,
        retests: sessions.reduce((sum, s) => sum + Math.max(0, s.attempts.length - 1), 0),
        compliance_percentage: completedSessions.length > 0
          ? Math.round((completedSessions.filter(s => s.result === 'pass').length / completedSessions.length) * 1000) / 10
          : 0,
      },
    });
  },

  // --- Filters ---
  instrumentFilters: { search: '' },
  setInstrumentFilters: (filters) => {
    set(state => ({
      instrumentFilters: { ...state.instrumentFilters, ...filters },
    }));
  },
    }),
    {
      name: 'nawi-metrology-storage-v2',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        instruments: state.instruments,
        configurations: state.configurations,
        testPlans: state.testPlans,
        testSessions: state.testSessions,
        evidence: state.evidence,
        reports: state.reports,
        auditLogs: state.auditLogs,
        notifications: state.notifications,
        ruleVersions: state.ruleVersions,
        activeRuleVersion: state.activeRuleVersion,
      }),
    }
  )
);
