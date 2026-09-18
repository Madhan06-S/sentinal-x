import { apiClient, USE_MOCK_API } from './client';
import { mockApiHandler } from '../mocks/mockApi';
import { Deployment } from '../types/deployment';

const normalizeDeployment = (d: any): Deployment => ({
  id: d.id,
  service: d.service_id || d.service || 'payment-service',
  version: d.version,
  commit_hash: d.meta?.commit_hash || d.commit_hash || d.id.slice(0, 7),
  environment: d.environment || 'production',
  author: d.meta?.author || d.author || 'devops-bot',
  timestamp: d.deployed_at || d.timestamp || new Date().toISOString(),
  status: d.status,
  change_summary: d.meta?.summary || d.change_summary || 'Service deployment update',
  linked_incident_id: d.linked_incident_id,
});

export const getDeployments = async (): Promise<Deployment[]> => {
  if (USE_MOCK_API) return mockApiHandler.getDeployments();
  const res = await apiClient.get('/deployments/');
  return res.data.map(normalizeDeployment);
};
