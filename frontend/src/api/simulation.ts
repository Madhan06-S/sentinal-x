import { apiClient, USE_MOCK_API } from './client';
import { mockApiHandler } from '../mocks/mockApi';

export const startSimulation = async (): Promise<{ status: string; incident_id: string }> => {
  if (USE_MOCK_API) return mockApiHandler.startSimulation();
  const res = await apiClient.post('/simulation/start');
  return res.data;
};
