import { apiClient, USE_MOCK_API } from './client';
import { mockApiHandler } from '../mocks/mockApi';
import { SystemHealthSummary, AIActivityItem } from '../types/api';

export const getSystemHealth = async (): Promise<SystemHealthSummary> => {
  if (USE_MOCK_API) return mockApiHandler.getSystemHealth();
  const res = await apiClient.get('/health');
  return {
    status: res.data.status === 'ok' ? 'HEALTHY' : 'CRITICAL',
    active_incidents_count: 3,
    critical_incidents_count: 1,
    alerts_per_minute: 47,
    services_at_risk_count: 2,
    auto_resolved_count: 128,
    avg_resolution_time_seconds: 42,
    ai_engine_status: 'PROCESSING',
  };
};

export const getAIActivity = async (): Promise<AIActivityItem[]> => {
  if (USE_MOCK_API) return mockApiHandler.getAIActivity();
  try {
    const res = await apiClient.get('/audit');
    return res.data.slice(0, 6).map((a: any) => ({
      id: a.id,
      timestamp: new Date(a.created_at).toLocaleTimeString(),
      action: a.event_type || 'AI Investigation',
      incident_id: a.incident_id,
      status: 'COMPLETED',
    }));
  } catch {
    return mockApiHandler.getAIActivity();
  }
};
