import {
  FACTORY_SUMMARIES,
  DATASET_INFOS,
  AUDIT_REPORTS,
  COMPANY_COMPARISON,
  FactorySummary,
  DatasetInfo,
  AuditReportData,
  CompanyComparison,
  SensorReading,
} from '../src/data/dataset.ts';

import {
  VERNACULAR_DISPATCHES,
  DPR_LOAN_DATA,
  CLUSTER_BENCHMARKS,
  TOD_TARIFF_STRUCTURE,
  MACHINE_SCHEDULE_ITEMS,
  VernacularDispatch,
  DprLoanData,
  ClusterBenchmark,
  TodSlot,
  MachineScheduleItem,
} from '../src/data/advancedFeatures.ts';

// Deep clone helper
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// In-memory mutable data stores initialized from the baseline datasets
export const summariesStore: Record<string, FactorySummary> = deepClone(FACTORY_SUMMARIES);
export const datasetInfosStore: Record<string, DatasetInfo> = deepClone(DATASET_INFOS);
export const auditReportsStore: Record<string, AuditReportData> = deepClone(AUDIT_REPORTS);
export const comparisonStore: CompanyComparison = deepClone(COMPANY_COMPARISON);

export const dispatchesStore: Record<string, VernacularDispatch[]> = deepClone(VERNACULAR_DISPATCHES);
export const dprStore: Record<string, DprLoanData> = deepClone(DPR_LOAN_DATA);
export const clusterStore: Record<string, ClusterBenchmark> = deepClone(CLUSTER_BENCHMARKS);
export const todSlotsStore: TodSlot[] = deepClone(TOD_TARIFF_STRUCTURE);
export const machineScheduleStore: Record<string, MachineScheduleItem[]> = deepClone(MACHINE_SCHEDULE_ITEMS);

// Acknowledged dispatches registry
export interface DispatchAcknowledgement {
  dispatchId: string;
  companyName: string;
  acknowledgedBy: string;
  timestamp: string;
  note?: string;
}

export const acknowledgementsRegistry: Record<string, DispatchAcknowledgement> = {
  'DISP-TA-01': {
    dispatchId: 'DISP-TA-01',
    companyName: 'TexAlpha Mills',
    acknowledgedBy: 'Shift C Supervisor (Rajesh Patil)',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    note: 'Loom speed reduced and lubrication scheduled',
  },
  'DISP-BW-01': {
    dispatchId: 'DISP-BW-01',
    companyName: 'BetaWeave Industries',
    acknowledgedBy: 'Boiler Maintenance Lead (Sunil Mehta)',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    note: 'Flue valve inspected',
  },
};

/**
 * Add a new sensor reading to the telemetry stream
 */
export function addSensorReading(companyName: string, reading: SensorReading) {
  const companyKey = datasetInfosStore[companyName] ? companyName : 'TexAlpha Mills';
  const info = datasetInfosStore[companyKey];

  info.readings.unshift(reading);
  info.row_count += 1;
  if (reading.fault_flag === 1) {
    info.total_faults += 1;
  }
  info.fault_rate_pct = Number(((info.total_faults / info.row_count) * 100).toFixed(1));

  // Update factory summary metrics dynamically
  const summary = summariesStore[companyKey];
  if (summary) {
    summary.total_readings += 1;
    summary.fault_rate_pct = info.fault_rate_pct;
    if (reading.power_kw > summary.peak_demand_kw) {
      summary.peak_demand_kw = Number(reading.power_kw.toFixed(1));
    }
  }

  return reading;
}

/**
 * Generate a synthetic live telemetry tick
 */
export function generateSimulationTick(companyName: string) {
  const companyKey = datasetInfosStore[companyName] ? companyName : 'TexAlpha Mills';
  const info = datasetInfosStore[companyKey];
  const machines = info.machines;

  const randomMachine = machines[Math.floor(Math.random() * machines.length)];
  const isLoom = randomMachine.type.toLowerCase().includes('loom');

  const basePower = isLoom ? 3.2 : 8.5;
  const jitterPower = Number((basePower + (Math.random() * 1.8 - 0.9)).toFixed(2));
  const isFault = Math.random() > 0.85 ? (1 as const) : (0 as const);

  const newReading: SensorReading = {
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    machine_id: randomMachine.id,
    machine_type: randomMachine.type,
    shift: (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)],
    temperature_c: Number((38 + Math.random() * 8 + (isFault ? 5 : 0)).toFixed(1)),
    humidity_pct: Number((62 + Math.random() * 6).toFixed(1)),
    power_kw: jitterPower,
    power_factor: Number((0.84 + Math.random() * 0.08).toFixed(3)),
    vibration_mm_s: Number((1.2 + Math.random() * 1.5 + (isFault ? 3.5 : 0)).toFixed(2)),
    noise_db: Number((68 + Math.random() * 12 + (isFault ? 8 : 0)).toFixed(1)),
    thread_tension_n: Number((9.0 + Math.random() * 1.2).toFixed(1)),
    production_count: Math.floor(4500 + Math.random() * 800),
    fault_flag: isFault,
    notes: isFault ? 'Auto-detected thermal anomaly' : 'Live sensor telemetry tick',
  };

  return addSensorReading(companyKey, newReading);
}
