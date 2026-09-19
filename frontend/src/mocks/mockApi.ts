import { simulationEngine } from './simulationEngine';
import { SystemHealthSummary } from '../types/api';

export const mockApiHandler = {
  getSystemHealth: async (): Promise<SystemHealthSummary> => {
    return {
      status: 'CRITICAL',
      active_incidents_count: simulationEngine.incidents.filter((i) => i.status !== 'RESOLVED').length,
      critical_incidents_count: simulationEngine.incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
      alerts_per_minute: 47,
      services_at_risk_count: simulationEngine.services.filter((s) => s.status !== 'HEALTHY').length,
      auto_resolved_count: 128,
      avg_resolution_time_seconds: 42,
      ai_engine_status: 'PROCESSING',
    };
  },

  getAIActivity: async () => {
    return simulationEngine.aiActivities;
  },

  getIncidents: async () => {
    return simulationEngine.incidents;
  },

  getIncidentById: async (id: string) => {
    const inc = simulationEngine.getIncidentById(id);
    if (!inc) throw new Error(`Incident with ID ${id} not found`);
    return inc;
  },

  getRCAGraph: async (incidentId: string) => {
    return simulationEngine.rcaGraph;
  },

  approveRemediation: async (incidentId: string) => {
    return simulationEngine.approveRemediation(incidentId);
  },

  rejectRemediation: async (incidentId: string, reason?: string) => {
    return simulationEngine.rejectRemediation(incidentId, reason);
  },

  getAlerts: async () => {
    return simulationEngine.alerts;
  },

  getAlertById: async (id: string) => {
    return simulationEngine.alerts.find((a) => a.id === id);
  },

  getServices: async () => {
    return simulationEngine.services;
  },

  getDeployments: async () => {
    return (await import('./data/initialData')).initialDeployments;
  },

  getAuditLogs: async () => {
    return simulationEngine.auditLogs;
  },

  startSimulation: async () => {
    return simulationEngine.startLiveSimulation();
  },
};
