// ============================================================
// R-76 CALCULATION ENGINE
// OIML Recommendation R-76 — Non-Automatic Weighing Instruments
// ============================================================
// This module implements the core calculation and compliance
// logic per OIML R-76. Values marked [CONFIGURABLE] can be
// adjusted by an admin via the Rule Version management UI.
// ============================================================

import type { AccuracyClass, LoadCondition, TestResult, MPETableEntry, R76RuleVersion, TestProcedure, TestStep } from '../types';

// -------------------------------------------------------
// 1. MPE TABLE  (OIML R-76, Table 3 — initial verification)
// -------------------------------------------------------
// The table below encodes the Maximum Permissible Error
// for initial and subsequent (in-service) verification.
//
// load_range_start_n / load_range_end_n are expressed as
// multiples of the verification scale interval (e).
//
// [CONFIGURABLE] — admins may edit via Settings → R-76 Rules

export const DEFAULT_MPE_TABLE: MPETableEntry[] = [
  // Class I
  { accuracy_class: 'I', load_range_start_n: 0, load_range_end_n: 50000, mpe_initial_e: 0.5, mpe_subsequent_e: 1.0 },
  { accuracy_class: 'I', load_range_start_n: 50000, load_range_end_n: 200000, mpe_initial_e: 1.0, mpe_subsequent_e: 2.0 },
  { accuracy_class: 'I', load_range_start_n: 200000, load_range_end_n: Infinity, mpe_initial_e: 1.5, mpe_subsequent_e: 3.0 },
  // Class II
  { accuracy_class: 'II', load_range_start_n: 0, load_range_end_n: 5000, mpe_initial_e: 0.5, mpe_subsequent_e: 1.0 },
  { accuracy_class: 'II', load_range_start_n: 5000, load_range_end_n: 20000, mpe_initial_e: 1.0, mpe_subsequent_e: 2.0 },
  { accuracy_class: 'II', load_range_start_n: 20000, load_range_end_n: Infinity, mpe_initial_e: 1.5, mpe_subsequent_e: 3.0 },
  // Class III
  { accuracy_class: 'III', load_range_start_n: 0, load_range_end_n: 500, mpe_initial_e: 0.5, mpe_subsequent_e: 1.0 },
  { accuracy_class: 'III', load_range_start_n: 500, load_range_end_n: 2000, mpe_initial_e: 1.0, mpe_subsequent_e: 2.0 },
  { accuracy_class: 'III', load_range_start_n: 2000, load_range_end_n: Infinity, mpe_initial_e: 1.5, mpe_subsequent_e: 3.0 },
  // Class IIII
  { accuracy_class: 'IIII', load_range_start_n: 0, load_range_end_n: 50, mpe_initial_e: 0.5, mpe_subsequent_e: 1.0 },
  { accuracy_class: 'IIII', load_range_start_n: 50, load_range_end_n: 200, mpe_initial_e: 1.0, mpe_subsequent_e: 2.0 },
  { accuracy_class: 'IIII', load_range_start_n: 200, load_range_end_n: Infinity, mpe_initial_e: 1.5, mpe_subsequent_e: 3.0 },
];

// -------------------------------------------------------
// 2. MPE LOOKUP
// -------------------------------------------------------

/**
 * Get the applicable Maximum Permissible Error (MPE) for a given load.
 *
 * @param accuracyClass - Instrument accuracy class (I, II, III, IIII)
 * @param loadInE       - The load expressed as multiples of e (n = load / e)
 * @param isInitial     - true for initial verification, false for subsequent
 * @param mpeTable      - MPE table to use (defaults to R-76 standard)
 * @returns MPE in multiples of e
 */
export function getMPE(
  accuracyClass: AccuracyClass,
  loadInE: number,
  isInitial: boolean = true,
  mpeTable: MPETableEntry[] = DEFAULT_MPE_TABLE
): number {
  const entry = mpeTable.find(
    (row) =>
      row.accuracy_class === accuracyClass &&
      loadInE >= row.load_range_start_n &&
      loadInE < row.load_range_end_n
  );

  if (!entry) {
    // Fallback: use the highest range for the class
    const classEntries = mpeTable
      .filter((row) => row.accuracy_class === accuracyClass)
      .sort((a, b) => b.load_range_start_n - a.load_range_start_n);
    if (classEntries.length > 0) {
      return isInitial ? classEntries[0].mpe_initial_e : classEntries[0].mpe_subsequent_e;
    }
    return 1.5; // Safe fallback [CONFIGURABLE]
  }

  return isInitial ? entry.mpe_initial_e : entry.mpe_subsequent_e;
}

// -------------------------------------------------------
// 3. ERROR CALCULATION
// -------------------------------------------------------
// Per OIML R-76 §3.5.1, the rounding-corrected error is:
//
//   E = I + (1/2)·d − ΔL − L
//
// Where:
//   E  = Error of indication
//   I  = Indication of the instrument
//   d  = Scale interval (resolution) of the instrument
//   ΔL = Rounding correction (obtained by adding small loads)
//   L  = Reference load (true value)
//
// For digital instruments where d = e, the simplified form
// without rounding correction is:
//
//   E = I − L
//
// This simplified form is used by default. When rounding-
// correction data is available, the full formula is applied.
// -------------------------------------------------------

export interface ErrorCalculationInput {
  indicatedValue: number;  // I — what the instrument shows
  referenceLoad: number;   // L — the true value
  scaleInterval?: number;  // d — typically equals e
  roundingCorrection?: number; // ΔL — from additional small loads
}

export interface ErrorCalculationResult {
  error: number;           // E — calculated error
  errorInE: number;        // Error expressed as multiples of e
  mpe: number;             // Applicable MPE (in units of measurement)
  mpeInE: number;          // MPE in multiples of e
  result: TestResult;      // pass | fail
  margin: number;          // How far inside/outside the MPE
  reason: string;          // Human-readable explanation
  formula: string;         // The formula used
  exceededBy?: number;     // How much MPE is exceeded (fail only)
}

/**
 * Calculate the error of indication and evaluate against MPE.
 */
export function calculateError(
  input: ErrorCalculationInput,
  accuracyClass: AccuracyClass,
  verificationInterval: number, // e
  isInitial: boolean = true,
  mpeTable: MPETableEntry[] = DEFAULT_MPE_TABLE
): ErrorCalculationResult {
  const { indicatedValue, referenceLoad, scaleInterval, roundingCorrection } = input;

  // Calculate error
  let error: number;
  let formula: string;

  if (roundingCorrection !== undefined && scaleInterval !== undefined) {
    // Full formula: E = I + (1/2)·d − ΔL − L
    error = indicatedValue + (0.5 * scaleInterval) - roundingCorrection - referenceLoad;
    formula = `E = I + ½d − ΔL − L = ${indicatedValue} + ${(0.5 * scaleInterval).toFixed(4)} − ${roundingCorrection} − ${referenceLoad}`;
  } else {
    // Simplified: E = I − L
    error = indicatedValue - referenceLoad;
    formula = `E = I − L = ${indicatedValue} − ${referenceLoad}`;
  }

  // Round to appropriate precision
  error = roundToInterval(error, verificationInterval);

  // Express error in multiples of e
  const errorInE = error / verificationInterval;

  // Determine load in terms of n (for MPE lookup)
  const loadInE = referenceLoad / verificationInterval;

  // Get applicable MPE (in multiples of e)
  const mpeInE = getMPE(accuracyClass, loadInE, isInitial, mpeTable);

  // MPE in measurement units
  const mpe = mpeInE * verificationInterval;

  // Evaluate
  const absErrorInE = Math.abs(errorInE);
  const margin = mpeInE - absErrorInE;

  let result: TestResult;
  let reason: string;
  let exceededBy: number | undefined;

  if (absErrorInE <= mpeInE) {
    result = 'pass';
    reason = `Measured error (${formatError(errorInE)}e) is within the applicable MPE (±${mpeInE}e). Margin: ${margin.toFixed(2)}e.`;
  } else {
    result = 'fail';
    exceededBy = absErrorInE - mpeInE;
    reason = `Measured error (${formatError(errorInE)}e) exceeds the applicable MPE (±${mpeInE}e) by ${exceededBy.toFixed(2)}e.`;
  }

  return {
    error,
    errorInE,
    mpe,
    mpeInE,
    result,
    margin,
    reason,
    formula,
    exceededBy,
  };
}

// -------------------------------------------------------
// 4. ECCENTRICITY TEST
// -------------------------------------------------------
// Per R-76, the eccentricity test checks if the indication
// changes when the load is placed at different positions on
// the load receptor. The max difference between any eccentric
// reading and the center reading must not exceed the MPE.
// -------------------------------------------------------

export interface EccentricityInput {
  positions: {
    position: string; // 'center', 'front-left', 'front-right', 'back-left', 'back-right'
    indicatedValue: number;
  }[];
  referenceLoad: number;
  centerIndication: number;
}

export interface EccentricityResult {
  positions: {
    position: string;
    indicatedValue: number;
    error: number;
    errorInE: number;
    mpe: number;
    mpeInE: number;
    result: TestResult;
    reason: string;
  }[];
  overallResult: TestResult;
  maxError: number;
  maxErrorPosition: string;
}

export function calculateEccentricity(
  input: EccentricityInput,
  accuracyClass: AccuracyClass,
  verificationInterval: number,
  isInitial: boolean = true,
  mpeTable: MPETableEntry[] = DEFAULT_MPE_TABLE
): EccentricityResult {
  const loadInE = input.referenceLoad / verificationInterval;
  const mpeInE = getMPE(accuracyClass, loadInE, isInitial, mpeTable);
  const mpe = mpeInE * verificationInterval;

  let maxAbsError = 0;
  let maxErrorPosition = '';

  const positions = input.positions.map((pos) => {
    const error = pos.indicatedValue - input.centerIndication;
    const errorInE = error / verificationInterval;
    const absErrorInE = Math.abs(errorInE);

    if (absErrorInE > maxAbsError) {
      maxAbsError = absErrorInE;
      maxErrorPosition = pos.position;
    }

    const result: TestResult = absErrorInE <= mpeInE ? 'pass' : 'fail';
    const reason = result === 'pass'
      ? `Deviation at ${pos.position} (${formatError(errorInE)}e) is within MPE (±${mpeInE}e).`
      : `Deviation at ${pos.position} (${formatError(errorInE)}e) exceeds MPE (±${mpeInE}e).`;

    return {
      position: pos.position,
      indicatedValue: pos.indicatedValue,
      error,
      errorInE,
      mpe,
      mpeInE,
      result,
      reason,
    };
  });

  const overallResult: TestResult = positions.every((p) => p.result === 'pass') ? 'pass' : 'fail';

  return {
    positions,
    overallResult,
    maxError: maxAbsError * verificationInterval,
    maxErrorPosition,
  };
}

// -------------------------------------------------------
// 5. REPEATABILITY TEST
// -------------------------------------------------------
// The difference between the max and min indications from
// repeated weighings at the same load must not exceed the
// absolute value of the MPE.
// -------------------------------------------------------

export interface RepeatabilityInput {
  readings: number[];
  referenceLoad: number;
}

export interface RepeatabilityResult {
  readings: number[];
  mean: number;
  range: number;      // max - min
  rangeInE: number;
  mpe: number;
  mpeInE: number;
  result: TestResult;
  reason: string;
  maxReading: number;
  minReading: number;
  standardDeviation: number;
}

export function calculateRepeatability(
  input: RepeatabilityInput,
  accuracyClass: AccuracyClass,
  verificationInterval: number,
  isInitial: boolean = true,
  mpeTable: MPETableEntry[] = DEFAULT_MPE_TABLE
): RepeatabilityResult {
  const { readings, referenceLoad } = input;
  const loadInE = referenceLoad / verificationInterval;
  const mpeInE = getMPE(accuracyClass, loadInE, isInitial, mpeTable);
  const mpe = mpeInE * verificationInterval;

  const maxReading = Math.max(...readings);
  const minReading = Math.min(...readings);
  const range = maxReading - minReading;
  const rangeInE = range / verificationInterval;
  const mean = readings.reduce((a, b) => a + b, 0) / readings.length;

  // Standard deviation
  const variance = readings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (readings.length - 1);
  const standardDeviation = Math.sqrt(variance);

  // The range must not exceed the absolute value of MPE
  const absRangeInE = Math.abs(rangeInE);
  const result: TestResult = absRangeInE <= Math.abs(mpeInE) ? 'pass' : 'fail';

  const reason = result === 'pass'
    ? `Range of ${readings.length} readings (${range.toFixed(4)} ${getUnitLabel()}, ${rangeInE.toFixed(2)}e) is within MPE (${mpeInE}e).`
    : `Range of ${readings.length} readings (${range.toFixed(4)} ${getUnitLabel()}, ${rangeInE.toFixed(2)}e) exceeds MPE (${mpeInE}e).`;

  return {
    readings,
    mean,
    range,
    rangeInE,
    mpe,
    mpeInE,
    result,
    reason,
    maxReading,
    minReading,
    standardDeviation,
  };
}

// -------------------------------------------------------
// 6. TEST LOAD GENERATION
// -------------------------------------------------------
// Generate standard test loads for a given instrument config.
// Loads are distributed across the capacity range to cover
// all MPE ranges per R-76.
// -------------------------------------------------------

export function generateTestLoads(
  maxCapacity: number,
  minCapacity: number,
  verificationInterval: number,
  accuracyClass: AccuracyClass
): number[] {
  const loads: number[] = [];
  const n = maxCapacity / verificationInterval;

  // Always include Min
  loads.push(minCapacity);

  // Get MPE range boundaries for this class
  const classEntries = DEFAULT_MPE_TABLE
    .filter((e) => e.accuracy_class === accuracyClass)
    .sort((a, b) => a.load_range_start_n - b.load_range_start_n);

  // Add loads near range boundaries
  for (const entry of classEntries) {
    if (entry.load_range_start_n > 0 && entry.load_range_start_n < n) {
      const boundaryLoad = entry.load_range_start_n * verificationInterval;
      if (boundaryLoad >= minCapacity && boundaryLoad <= maxCapacity) {
        // Just before and at the boundary
        const before = (entry.load_range_start_n - 1) * verificationInterval;
        if (before >= minCapacity && !loads.includes(before)) loads.push(before);
        if (!loads.includes(boundaryLoad)) loads.push(boundaryLoad);
      }
    }
  }

  // Add intermediate loads (25%, 50%, 75% of Max)
  const quarterPoints = [0.25, 0.5, 0.75, 1.0];
  for (const pct of quarterPoints) {
    const load = roundToInterval(maxCapacity * pct, verificationInterval);
    if (load >= minCapacity && load <= maxCapacity && !loads.includes(load)) {
      loads.push(load);
    }
  }

  // Sort and return unique loads
  return [...new Set(loads)].sort((a, b) => a - b);
}

// -------------------------------------------------------
// 7. ECCENTRICITY LOAD & POSITIONS
// -------------------------------------------------------

export const ECCENTRICITY_POSITIONS = [
  { id: 'center', label: 'Center', description: 'Load placed at the center of the receptor' },
  { id: 'front-left', label: 'Front Left', description: 'Load placed at the front-left quadrant' },
  { id: 'front-right', label: 'Front Right', description: 'Load placed at the front-right quadrant' },
  { id: 'back-left', label: 'Back Left', description: 'Load placed at the back-left quadrant' },
  { id: 'back-right', label: 'Back Right', description: 'Load placed at the back-right quadrant' },
];

export function getEccentricityLoad(maxCapacity: number): number {
  // Per R-76, eccentricity test load is typically 1/3 of Max
  return roundToInterval(maxCapacity / 3, 1);
}

// -------------------------------------------------------
// 8. UTILITIES
// -------------------------------------------------------

function roundToInterval(value: number, interval: number): number {
  return Math.round(value / interval) * interval;
}

function formatError(errorInE: number): string {
  const sign = errorInE >= 0 ? '+' : '';
  return `${sign}${errorInE.toFixed(2)}`;
}

function getUnitLabel(): string {
  return 'units'; // Overridden by context
}

// -------------------------------------------------------
// 9. DEFAULT RULE VERSION
// -------------------------------------------------------

export function createDefaultRuleVersion(): R76RuleVersion {
  return {
    id: 'r76-v1',
    version: '1.0.0',
    name: 'OIML R-76-1 (2006)',
    status: 'active',
    effective_date: '2006-01-01',
    last_updated: new Date().toISOString(),
    updated_by: 'system',
    description: 'OIML Recommendation R-76, Part 1: Metrological and technical requirements for non-automatic weighing instruments. Defines accuracy classes, MPE tables, and test procedures.',
    mpe_table: DEFAULT_MPE_TABLE,
    test_procedures: getDefaultTestProcedures(),
  };
}

function getDefaultTestProcedures(): TestProcedure[] {
  return [
    {
      test_type: 'accuracy',
      name: 'Accuracy Test',
      description: 'Determine the error of indication at multiple test loads across the weighing range by comparing instrument indications with reference standards.',
      is_mandatory: true,
      estimated_duration_minutes: 30,
      required_measurements: 0, // Dynamically calculated based on config
      steps: getAccuracySteps(),
    },
    {
      test_type: 'eccentricity',
      name: 'Eccentricity Test',
      description: 'Evaluate the effect of off-center loading on instrument indications by placing a test load at different positions on the load receptor.',
      is_mandatory: true,
      estimated_duration_minutes: 20,
      required_measurements: 5,
      steps: getEccentricitySteps(),
    },
    {
      test_type: 'repeatability',
      name: 'Repeatability Test',
      description: 'Assess the ability of the instrument to provide closely agreeing results for repeated weighings of the same load under the same conditions.',
      is_mandatory: true,
      estimated_duration_minutes: 15,
      required_measurements: 10,
      steps: getRepeatabilitySteps(),
    },
  ];
}

function getAccuracySteps(): TestStep[] {
  return [
    {
      step_number: 1,
      instruction: 'Ensure the instrument is on a stable, level surface. Verify that the instrument is properly zeroed before beginning.',
      requires_input: false,
    },
    {
      step_number: 2,
      instruction: 'Prepare the required reference weights/standards. Ensure they are clean and have valid calibration certificates.',
      requires_input: false,
    },
    {
      step_number: 3,
      instruction: 'Apply the reference load to the instrument. Record the indicated value. Perform measurements with both increasing and decreasing loads.',
      requires_input: true,
      input_type: 'numeric',
      input_label: 'Indicated Value',
    },
    {
      step_number: 4,
      instruction: 'Remove the load and verify the instrument returns to zero. Proceed to the next test load.',
      requires_input: false,
    },
  ];
}

function getEccentricitySteps(): TestStep[] {
  return [
    {
      step_number: 1,
      instruction: 'Prepare the eccentricity test load (approximately 1/3 of Max capacity). Ensure the instrument is zeroed.',
      requires_input: false,
    },
    {
      step_number: 2,
      instruction: 'Place the test load at the CENTER of the load receptor. Record the indication.',
      requires_input: true,
      input_type: 'numeric',
      input_label: 'Center Indication',
    },
    {
      step_number: 3,
      instruction: 'Place the test load at each eccentric position (front-left, front-right, back-left, back-right). Record each indication.',
      requires_input: true,
      input_type: 'numeric',
      input_label: 'Eccentric Indication',
    },
  ];
}

function getRepeatabilitySteps(): TestStep[] {
  return [
    {
      step_number: 1,
      instruction: 'Select a test load near 50% of Max capacity. Ensure the instrument is properly zeroed.',
      requires_input: false,
    },
    {
      step_number: 2,
      instruction: 'Apply the test load, record the indication, then fully remove the load and allow the instrument to stabilize at zero. Repeat this process for each measurement.',
      requires_input: true,
      input_type: 'numeric',
      input_label: 'Indicated Value',
    },
  ];
}
