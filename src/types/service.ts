export type ServiceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE';

export interface ServiceMetric {
  cpu_percent: number;
  memory_percent: number;
  error_rate_percent: number;
  p99_latency_ms: number;
  requests_per_sec: number;
}

export interface ServiceInfo {
  id: string;
  name: string;
  category: 'API' | 'DATABASE' | 'CACHE' | 'AUTH' | 'GATEWAY' | 'BACKGROUND';
  status: ServiceHealthStatus;
  metrics: ServiceMetric;
  active_alerts_count: number;
  version: string;
  last_deployed_at: string;
  owner_team: string;
  dependencies: string[];
}
