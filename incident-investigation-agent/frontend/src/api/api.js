/**
 * Centralized API Client for Autonomous Incident Resolution Engine Backend
 */

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // If hosted on same origin as backend
    return `${window.location.origin}/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${url}:`, error.message);
    throw error;
  }
}

export const api = {
  // Health & System
  getHealth: () => request('/health'),

  // Incidents
  getIncidents: (status = null) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/incidents${query}`);
  },

  getIncidentDetail: (id) => request(`/incidents/${id}`),

  getIncidentAlerts: (id) => request(`/incidents/${id}/alerts`),

  getIncidentTimeline: (id) => request(`/incidents/${id}/timeline`),

  getIncidentGraph: (id) => request(`/incidents/${id}/graph`),

  investigateIncident: (id) => request(`/incidents/${id}/investigate`, { method: 'POST' }),

  approveIncident: (id, approvedBy = 'Human Operator', comment = 'Approved from UI dashboard') =>
    request(`/incidents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved_by: approvedBy, comment, decision: 'APPROVED' }),
    }),

  rejectIncident: (id, rejectedBy = 'Human Operator', comment = 'Rejected from UI dashboard') =>
    request(`/incidents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejected_by: rejectedBy, comment }),
    }),

  remediateIncident: (id) => request(`/incidents/${id}/remediate`, { method: 'POST' }),

  // Telemetry Events / Alerts
  getAlerts: (service = null, status = null) => {
    const params = new URLSearchParams();
    if (service) params.append('service', service);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/alerts${queryString}`);
  },

  // Audit Logs
  getAuditLogs: (incidentId = null) => {
    const query = incidentId ? `?incident_id=${encodeURIComponent(incidentId)}` : '';
    return request(`/audit/${query}`);
  },

  // Simulation
  startSimulation: (scenario = 'cascade') =>
    request(`/simulation/start?scenario=${encodeURIComponent(scenario)}`, { method: 'POST' }),

  getSimulationStatus: () => request('/simulation/status'),

  // Services & Deployments
  getServices: () => request('/services'),
  getDeployments: () => request('/deployments'),
};
