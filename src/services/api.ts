import {
  FACTORY_SUMMARIES,
  DATASET_INFOS,
  AUDIT_REPORTS,
  COMPANY_COMPARISON,
  FactorySummary,
  DatasetInfo,
  AuditReportData,
  CompanyComparison,
} from '../data/dataset';

// In-memory plain JS cache for API responses
const apiCache: Record<string, unknown> = {};

export function clearApiCache(companyName?: string) {
  if (companyName) {
    Object.keys(apiCache).forEach((key) => {
      if (key.includes(companyName)) {
        delete apiCache[key];
      }
    });
  } else {
    Object.keys(apiCache).forEach((key) => delete apiCache[key]);
  }
}

/**
 * Endpoint 1: GET /companies/{name}/summary
 */
export async function getCompanySummary(
  companyName: string,
  forceRefresh = false
): Promise<FactorySummary> {
  const cacheKey = `summary_${companyName}`;
  if (!forceRefresh && apiCache[cacheKey]) {
    return apiCache[cacheKey] as FactorySummary;
  }

  try {
    const encodedName = encodeURIComponent(companyName);
    const response = await fetch(`/api/v1/companies/${encodedName}/summary`);
    if (response.ok) {
      const data = await response.json();
      apiCache[cacheKey] = data;
      return data;
    }
  } catch {
    // Fallback to local high-fidelity dataset
  }

  // Artificial industrial micro-latency to showcase loading state
  await new Promise((resolve) => setTimeout(resolve, 220));

  const data = FACTORY_SUMMARIES[companyName] || FACTORY_SUMMARIES['TexAlpha Mills'];
  apiCache[cacheKey] = data;
  return data;
}

/**
 * Endpoint 2: GET /companies/{name}/readings?limit=20
 */
export async function getCompanyReadings(
  companyName: string,
  limit = 20,
  forceRefresh = false
): Promise<DatasetInfo> {
  const cacheKey = `readings_${companyName}_${limit}`;
  if (!forceRefresh && apiCache[cacheKey]) {
    return apiCache[cacheKey] as DatasetInfo;
  }

  try {
    const encodedName = encodeURIComponent(companyName);
    const response = await fetch(
      `/api/v1/companies/${encodedName}/readings?limit=${limit}`
    );
    if (response.ok) {
      const data = await response.json();
      apiCache[cacheKey] = data;
      return data;
    }
  } catch {
    // Fallback to local dataset
  }

  await new Promise((resolve) => setTimeout(resolve, 220));

  const baseInfo = DATASET_INFOS[companyName] || DATASET_INFOS['TexAlpha Mills'];
  const data: DatasetInfo = {
    ...baseInfo,
    readings: baseInfo.readings.slice(0, limit),
  };
  apiCache[cacheKey] = data;
  return data;
}

/**
 * Endpoint 3: GET /companies/{name}/audit
 */
export async function getCompanyAudit(
  companyName: string,
  forceRefresh = false
): Promise<AuditReportData> {
  const cacheKey = `audit_${companyName}`;
  if (!forceRefresh && apiCache[cacheKey]) {
    return apiCache[cacheKey] as AuditReportData;
  }

  try {
    const encodedName = encodeURIComponent(companyName);
    const response = await fetch(`/api/v1/companies/${encodedName}/audit`);
    if (response.ok) {
      const data = await response.json();
      apiCache[cacheKey] = data;
      return data;
    }
  } catch {
    // Fallback to local dataset
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  const data = AUDIT_REPORTS[companyName] || AUDIT_REPORTS['TexAlpha Mills'];
  apiCache[cacheKey] = data;
  return data;
}

/**
 * Endpoint 4: GET /audit/compare
 */
export async function getAuditComparison(
  forceRefresh = false
): Promise<CompanyComparison> {
  const cacheKey = 'audit_compare';
  if (!forceRefresh && apiCache[cacheKey]) {
    return apiCache[cacheKey] as CompanyComparison;
  }

  try {
    const response = await fetch('/api/v1/audit/compare');
    if (response.ok) {
      const data = await response.json();
      apiCache[cacheKey] = data;
      return data;
    }
  } catch {
    // Fallback to local dataset
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const data = COMPANY_COMPARISON;
  apiCache[cacheKey] = data;
  return data;
}

export interface BackendHealth {
  status: string;
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  service: string;
  companiesMonitored: string[];
  totalReadingsTracked: number;
  aiModule: {
    provider: string;
    active: boolean;
  };
}

export async function getBackendHealth(): Promise<BackendHealth | null> {
  try {
    const response = await fetch('/api/v1/health');
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Server offline
  }
  return null;
}

export async function triggerSimulationTick(companyName: string) {
  try {
    const encoded = encodeURIComponent(companyName);
    const response = await fetch(`/api/v1/companies/${encoded}/simulate-tick`, {
      method: 'POST',
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // fallback
  }
  return null;
}
