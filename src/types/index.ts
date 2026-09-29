// ============================================================
// METROLOGY NAWI TESTING PLATFORM — Core Type Definitions
// ============================================================

import type React from 'react';

// --- Enums ---
export type UserRole = 'admin' | 'operator' | 'reviewer' | 'auditor';

export type InstrumentStatus = 'draft' | 'registered' | 'configured' | 'under_test' | 'compliant' | 'non_compliant' | 'review';

export type TestType = 'accuracy' | 'eccentricity' | 'repeatability' | 'discrimination' | 'tare_zero' | 'creep' | 'temperature' | 'voltage' | 'warmup';

export type TestSessionStatus = 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export type TestResult = 'pass' | 'fail' | 'pending' | 'in_progress';

export type AccuracyClass = 'I' | 'II' | 'III' | 'IIII';

export type LoadCondition = 'increasing' | 'decreasing';

// --- User ---
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

// --- Instrument ---
export interface Instrument {
  id: string;
  instrument_id: string; // e.g. W-2026-001
  manufacturer: string;
  model: string;
  serial_number: string;
  instrument_type: string;
  accuracy_class: AccuracyClass;
  max_capacity: number;
  verification_interval: number; // e
  num_verification_intervals: number; // n = Max / e
  min_capacity: number;
  unit: string;
  location: string;
  manufacturer_details?: string;
  owner_organization: string;
  date_received: string;
  status: InstrumentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

// --- Instrument Configuration ---
export interface InstrumentConfiguration {
  id: string;
  instrument_id: string;
  accuracy_class: AccuracyClass;
  max_capacity: number;
  verification_interval: number;
  num_verification_intervals: number;
  min_capacity: number;
  unit: string;
  rule_version_id: string;
  is_valid: boolean;
  validation_errors: string[];
  configured_by: string;
  configured_at: string;
}

// --- R-76 Rule Version ---
export interface R76RuleVersion {
  id: string;
  version: string;
  name: string;
  status: 'active' | 'draft' | 'deprecated';
  effective_date: string;
  last_updated: string;
  updated_by: string;
  description: string;
  mpe_table: MPETableEntry[];
  test_procedures: TestProcedure[];
}

export interface MPETableEntry {
  accuracy_class: AccuracyClass;
  load_range_start_n: number; // in terms of n (verification intervals)
  load_range_end_n: number;
  mpe_initial_e: number; // MPE for initial verification (in multiples of e)
  mpe_subsequent_e: number; // MPE for subsequent verification
}

export interface TestProcedure {
  test_type: TestType;
  name: string;
  description: string;
  is_mandatory: boolean;
  estimated_duration_minutes: number;
  steps: TestStep[];
  required_measurements: number;
}

export interface TestStep {
  step_number: number;
  instruction: string;
  requires_input: boolean;
  input_type?: 'numeric' | 'text' | 'dropdown' | 'evidence';
  input_label?: string;
  input_options?: string[];
}

// --- Test Plan ---
export interface TestPlan {
  id: string;
  instrument_id: string;
  rule_version_id: string;
  tests: TestPlanItem[];
  generated_by: string;
  generated_at: string;
  status: 'generated' | 'active' | 'completed';
}

export interface TestPlanItem {
  test_type: TestType;
  name: string;
  sequence: number;
  status: TestResult;
  estimated_duration_minutes: number;
  required_measurements: number;
  is_mandatory: boolean;
}

// --- Test Session ---
export interface TestSession {
  id: string;
  test_plan_id: string;
  instrument_id: string;
  test_type: TestType;
  status: TestSessionStatus;
  operator_id: string;
  operator_name: string;
  started_at: string;
  completed_at?: string;
  current_step: number;
  total_steps: number;
  progress: number;
  attempts: TestAttempt[];
  result?: TestResult;
}

// --- Test Attempt ---
export interface TestAttempt {
  id: string;
  session_id: string;
  attempt_number: number;
  measurements: TestMeasurement[];
  result: TestResult;
  reason?: string;
  started_at: string;
  completed_at?: string;
  operator_id: string;
  operator_name: string;
  notes?: string;
}

// --- Test Measurement ---
export interface TestMeasurement {
  id: string;
  attempt_id: string;
  measurement_number: number;
  reference_load: number;
  indicated_value: number;
  load_condition: LoadCondition;
  error: number;
  mpe: number;
  result: TestResult;
  reason: string;
  unit: string;
  position?: string; // For eccentricity (center, front-left, etc.)
  recorded_at: string;
  recorded_by: string;
  observation?: string;
}

// --- Evidence ---
export interface Evidence {
  id: string;
  instrument_id: string;
  test_session_id?: string;
  test_attempt_id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  description?: string;
}

// --- Report ---
export interface Report {
  id: string;
  report_number: string;
  instrument_id: string;
  report_type: 'standard' | 'detailed' | 'retest';
  instrument: Instrument;
  configuration: InstrumentConfiguration;
  test_sessions: TestSession[];
  compliance_result: TestResult;
  compliance_summary: ComplianceSummary;
  generated_by: string;
  generated_by_name: string;
  generated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rule_version: string;
  organization_name: string;
}

export interface ComplianceSummary {
  overall_result: TestResult;
  tests: ComplianceTestResult[];
  total_measurements: number;
  passed_measurements: number;
  failed_measurements: number;
  compliance_percentage: number;
}

export interface ComplianceTestResult {
  test_type: TestType;
  test_name: string;
  result: TestResult;
  measurements_count: number;
  passed_count: number;
  failed_count: number;
  max_error: number;
  max_mpe: number;
  attempts_count: number;
}

// --- Audit Log ---
export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  entity_type: 'instrument' | 'test_session' | 'test_attempt' | 'measurement' | 'report' | 'evidence' | 'user' | 'rule' | 'system';
  entity_id: string;
  details: string;
  metadata?: Record<string, unknown>;
}

// --- Dashboard Metrics ---
export interface DashboardMetrics {
  registered_instruments: number;
  instruments_change: number;
  active_tests: number;
  tests_requiring_attention: number;
  tests_this_month: number;
  pending_tests: number;
  passed_tests: number;
  failed_tests: number;
  retests: number;
  compliance_percentage: number;
}

// --- Notification ---
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  action_url?: string;
}

// --- Form validation ---
export interface ValidationError {
  field: string;
  message: string;
}

// --- Generic table types ---
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search: string;
  status?: string;
  accuracy_class?: string;
  manufacturer?: string;
  date_from?: string;
  date_to?: string;
  result?: string;
}
