import type { DashboardStats, HealthStatus, ScanResult } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Thrown when the API responds with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/** GET /api/health: backend and database status. */
export function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>('/health');
}

// TODO: The endpoints below are not defined yet. Update paths, methods and
// payloads once the ASP.NET backend contract exists.

export function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/dashboard/stats');
}

export function scanIn(barcode: string): Promise<ScanResult> {
  return request<ScanResult>('/scan-in', {
    method: 'POST',
    body: JSON.stringify({ barcode }),
  });
}

export function scanOut(barcode: string): Promise<ScanResult> {
  return request<ScanResult>('/scan-out', {
    method: 'POST',
    body: JSON.stringify({ barcode }),
  });
}
