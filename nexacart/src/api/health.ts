import { SystemHealthStatus } from '../types/incident';

export interface HealthResponse {
  service: string;
  status: SystemHealthStatus;
  memory_usage: number;
  db_connections: number;
  api_latency: number;
  payment_failure_rate: number;
  timestamp?: string;
}

/**
 * Reads local application health status.
 */
export async function getLocalHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}
