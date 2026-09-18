import { apiClient, USE_MOCK_API } from './client';
import { mockApiHandler } from '../mocks/mockApi';
import { AuditEntry } from '../types/audit';

const normalizeAudit = (a: any): AuditEntry => ({
  id: a.id,
  timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString() : a.timestamp,
  actor: a.details?.actor || a.details?.approved_by || 'Aegis System',
  actor_type: a.event_type?.includes('AI') ? 'AI_ENGINE' : a.event_type?.includes('APPROVAL') ? 'ENGINEER' : 'SYSTEM',
  action: a.event_type || a.action,
  resource: a.incident_id ? `INC-${a.incident_id}` : a.resource || 'System',
  incident_id: a.incident_id,
  result: a.details?.result || 'SUCCESS',
  details: a.details,
});

export const getAuditLogs = async (): Promise<AuditEntry[]> => {
  if (USE_MOCK_API) return mockApiHandler.getAuditLogs();
  const res = await apiClient.get('/audit/');
  return res.data.map(normalizeAudit);
};
