import axios from 'axios';

/**
 * BFF Data Access Token flow (MS-API-002 / MS-FE-002):
 *
 *   1. Frontend calls POST /v1/bff/token once per session (or when token expires).
 *   2. Backend mints a short-lived JWT (5-15 min TTL) scoped to the user's plan.
 *   3. This module caches the token in memory and auto-refreshes 60s before expiry.
 *   4. All /v1/* requests attach the token as `Authorization: Bearer <jwt>`.
 *
 * Dev fallback: if NEXT_PUBLIC_DEV_API_KEY is set, it is used directly as
 *   `x-api-key` (skipping the BFF round-trip) so local dev can still work
 *   when the BFF endpoint is unreachable.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://ser-actively-projection-lines.trycloudflare.com/v1';

if (typeof window !== 'undefined') {
  console.log('[api/client] Target:', API_BASE_URL);
}

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
  plan: string;
}

let cachedToken: CachedToken | null = null;
let inFlight: Promise<CachedToken> | null = null;

// Clerk session context — set by the frontend when a user is available.
// When null, the BFF endpoint falls back to a guest-browser principal.
let clerkContext: { userId?: string; plan?: string } = {};

export function setClerkContext(ctx: { userId?: string; plan?: string }) {
  clerkContext = ctx;
  // Invalidate cached token so the next request re-mints under the new identity.
  cachedToken = null;
}

async function fetchToken(): Promise<CachedToken> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (clerkContext.userId) headers['x-clerk-user-id'] = clerkContext.userId;
  if (clerkContext.plan) headers['x-clerk-plan'] = clerkContext.plan;

  const res = await axios.post(
    `${API_BASE_URL}/bff/token`,
    {},
    { headers, timeout: 8000 },
  );
  const data = res.data as {
    access_token: string;
    expires_in: number;
    plan: string;
  };
  return {
    token: data.access_token,
    plan: data.plan,
    // Refresh 60s before server expiry.
    expiresAt: Date.now() + Math.max(30, data.expires_in - 60) * 1000,
  };
}

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  if (!inFlight) {
    inFlight = fetchToken().finally(() => {
      inFlight = null;
    });
  }
  try {
    cachedToken = await inFlight;
    return cachedToken.token;
  } catch (err) {
    // BFF unreachable — let the request proceed unauthenticated (guest).
    console.warn('[api/client] BFF token fetch failed', err);
    return null;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set?.('Authorization', `Bearer ${token}`);
  }
  return config;
});

// On 401 clear the cached token so the next call re-mints.
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      cachedToken = null;
    }
    return Promise.reject(err);
  },
);

export interface BatchRequestItem {
  dataset_id: string;
  from_utc?: string;
  to_utc?: string;
  resolution?: string;
  request_key?: string;
}

export interface BatchRequest {
  datasets: BatchRequestItem[];
  from_utc?: string;
  to_utc?: string;
  resolution?: string;
}

export const energyApi = {
  fetchBatch: async (request: BatchRequest) => {
    const { data } = await apiClient.post('/series/batch', request);
    return data;
  },

  getCatalog: async () => {
    const { data } = await apiClient.get('/catalog');
    return data.results;
  },

  getSystemHealth: async () => {
    const { data } = await apiClient.get('/system/health');
    return data;
  },

  suggest: async (q: string) => {
    const { data } = await apiClient.get('/catalog/suggest', { params: { q } });
    return data.results;
  },

  getEuTable: async (date?: string) => {
    const { data } = await apiClient.get('/summary/eu-table', { params: { date } });
    return data;
  },

  getGasSummary: async () => {
    const { data } = await apiClient.get('/summary/gas');
    return data;
  },

  searchCatalog: async (params: { q?: string; region?: string; type?: string }) => {
    const { data } = await apiClient.get('/catalog/search', { params });
    return data;
  },

  getDatasetSnapshots: async (datasetId: string) => {
    const { data } = await apiClient.get(`/catalog/datasets/${datasetId}/snapshots`);
    return data.snapshots;
  },

  getForecastLatest: async (datasetId: string) => {
    const { data } = await apiClient.get('/forecast/latest', { params: { dataset_id: datasetId } });
    return data.data;
  },

  getForecastAsOf: async (datasetId: string, asOf: string) => {
    const { data } = await apiClient.get('/forecast/as_of', {
      params: { dataset_id: datasetId, as_of_issue_date: asOf },
    });
    return data.data;
  },

  // MS-FE-005: KPI summary cards (Country dashboard top row)
  getKpis: async (country: string) => {
    const { data } = await apiClient.get('/summary/kpis', { params: { country } });
    return data;
  },

  getFuturesSummary: async () => {
    const { data } = await apiClient.get('/summary/futures');
    return data;
  },

  getRetailSummary: async () => {
    const { data } = await apiClient.get('/summary/retail');
    return data;
  },

  getCatalogForCountry: async (cc: string, onlyWithData = true) => {
    const { data } = await apiClient.get('/catalog/for-country', { params: { cc, only_with_data: onlyWithData } });
    return data;
  },

  // MS-API-010: Sync CSV export — GET /v1/exports/timeseries.csv
  exportCsv: async (datasetId: string, fromUtc: string, toUtc: string, resolution = '1h') => {
    const response = await apiClient.get('/exports/timeseries.csv', {
      params: { dataset_id: datasetId, from_utc: fromUtc, to_utc: toUtc, resolution },
      responseType: 'blob',
    });
    return response;
  },

  // MS-API-010: Create async export job when sync limits exceeded
  createExportJob: async (params: {
    dataset_id: string;
    from_utc: string;
    to_utc: string;
    resolution?: string;
    format?: string;
  }) => {
    const { data } = await apiClient.post('/exports/jobs', params);
    return data;
  },

  // MS-FE-007: Snapshot curve slot picker
  getSnapshotTimes: async (datasetId: string) => {
    const { data } = await apiClient.get('/snapshot_curves/available_times', {
      params: { dataset_id: datasetId },
    });
    return data.slots;
  },

  // MS-API-002: Current user profile + effective plan limits
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
