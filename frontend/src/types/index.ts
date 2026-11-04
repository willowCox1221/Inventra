/** Aggregate inventory numbers shown on the dashboard. */
export interface DashboardStats {
  totalInventory: number;
  lowStock: number;
  outOfStock: number;
}

/** Response of GET /api/health. */
export interface HealthStatus {
  status: string;
  /** ISO 8601 date string. */
  timestamp: string;
  mongo: 'ok' | 'not_configured' | 'unreachable';
  mongoDetail: string | null;
}

/**
 * Result of a scan-in / scan-out request.
 * TODO: Shape is a placeholder until the backend contract is defined.
 */
export interface ScanResult {
  barcode: string;
  message?: string;
}
