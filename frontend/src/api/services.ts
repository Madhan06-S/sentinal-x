import { apiClient, USE_MOCK_API } from './client';
import { mockApiHandler } from '../mocks/mockApi';
import { ServiceInfo } from '../types/service';

const normalizeService = (s: any): ServiceInfo => ({
  id: s.id,
  name: s.name,
  category: (s.kind || s.category || 'API').toUpperCase(),
  status: s.status || (s.criticality === 'CRITICAL' ? 'DEGRADED' : 'HEALTHY'),
  metrics: s.metrics || {
    cpu_percent: s.meta?.cpu || Math.floor(20 + Math.random() * 60),
    memory_percent: s.meta?.memory || Math.floor(30 + Math.random() * 50),
    error_rate_percent: s.meta?.error_rate || 0.01,
    p99_latency_ms: s.meta?.p99 || 45,
    requests_per_sec: s.meta?.rps || 1200,
  },
  active_alerts_count: s.active_alerts_count || 0,
  version: s.version || s.meta?.version || 'v1.0.0',
  last_deployed_at: s.created_at || new Date().toISOString(),
  owner_team: s.business_function || 'Engineering',
  dependencies: s.depends_on || [],
});

export const getServices = async (): Promise<ServiceInfo[]> => {
  if (USE_MOCK_API) return mockApiHandler.getServices();
  const res = await apiClient.get('/services/');
  return res.data.map(normalizeService);
};
