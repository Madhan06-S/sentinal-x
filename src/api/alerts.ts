import { apiClient, USE_MOCK_API } from './client';
import { mockApiHandler } from '../mocks/mockApi';
import { Alert } from '../types/alert';

const normalizeAlert = (a: any): Alert => ({
  id: a.id,
  source: a.source,
  service: a.service,
  alert_type: a.alert_type || a.message,
  severity: a.severity,
  message: a.message,
  timestamp: a.timestamp || a.created_at,
  metadata: a.metadata || a.meta,
  status: a.status,
  incident_id: a.incident_id,
});

export const getAlerts = async (): Promise<Alert[]> => {
  if (USE_MOCK_API) return mockApiHandler.getAlerts();
  const res = await apiClient.get('/alerts/');
  return res.data.map(normalizeAlert);
};

export const getAlertById = async (id: string): Promise<Alert | undefined> => {
  if (USE_MOCK_API) return mockApiHandler.getAlertById(id);
  const res = await apiClient.get(`/alerts/${id}`);
  return normalizeAlert(res.data);
};
