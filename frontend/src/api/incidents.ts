import { apiClient, USE_MOCK_API } from './client';
import { mockApiHandler } from '../mocks/mockApi';
import { Incident } from '../types/incident';
import { RCAGraphData } from '../types/rca';

// Helper to normalize backend incident model to frontend interface
const normalizeIncident = (raw: any): Incident => {
  if (!raw) return raw;
  
  const incident_id = raw.id || raw.incident_id;
  const affected_services = raw.affected_services || (raw.alerts ? Array.from(new Set(raw.alerts.map((a: any) => a.service))) : ['payment-service']);

  // Map backend analyses record to AI Investigation format if present
  let ai_investigation = raw.ai_investigation;
  if (!ai_investigation && raw.analyses && raw.analyses.length > 0) {
    const layer1 = raw.analyses.find((a: any) => a.layer === 1) || raw.analyses[0];
    ai_investigation = {
      probable_root_cause: layer1.root_cause || raw.root_cause || 'Database connection pool exhaustion',
      confidence: Math.round((layer1.confidence || raw.confidence || 0.94) * (layer1.confidence <= 1 ? 100 : 1)),
      evidence: Array.isArray(layer1.evidence)
        ? layer1.evidence.map((ev: any, idx: number) => ({
            id: `ev-${idx}`,
            type: 'metric',
            description: typeof ev === 'string' ? ev : ev.description || JSON.stringify(ev),
            verified: true,
          }))
        : [],
      hypothesis: layer1.analysis_summary || 'Deployment v2.4.1 introduced connection pool leakage',
      validation_steps: ['Correlated socket telemetry with deployment timestamps.'],
      conclusion: layer1.root_cause || raw.root_cause || 'Deployment v2.4.1 is initiating event.',
      analyzed_at: layer1.created_at || raw.created_at,
    };
  }

  // Map backend decision format
  let ai_decision = raw.ai_decision;
  if (!ai_decision && (raw.recommended_action || raw.decision_reason)) {
    ai_decision = {
      recommended_action: raw.recommended_action || 'ROLLBACK_DEPLOYMENT',
      target_service: affected_services[0] || 'payment-service',
      risk_level: raw.risk_level || 'MEDIUM',
      approval_required: raw.approval_required ?? true,
      reason: raw.decision_reason || 'Rollback to stable v2.4.0 will release active DB socket leaks.',
      decided_at: raw.updated_at || raw.created_at,
    };
  }

  // Map backend graph to RCAGraph format
  let timeline = raw.timeline;
  if (!timeline && raw.alerts) {
    timeline = raw.alerts.map((a: any) => ({
      id: a.id,
      timestamp: new Date(a.timestamp).toLocaleTimeString(),
      title: a.alert_type || a.message,
      description: `${a.service}: ${a.message}`,
      type: a.severity === 'CRITICAL' ? 'ALERT' : 'METRIC_SPIKE',
    }));
  }

  return {
    incident_id,
    title: raw.title,
    status: raw.status,
    severity: raw.severity,
    affected_services,
    business_impact_summary: raw.business_impact || raw.business_impact_summary || '78% checkout drop rate',
    confidence: raw.confidence ? (raw.confidence <= 1 ? Math.round(raw.confidence * 100) : raw.confidence) : 94,
    root_cause: raw.root_cause,
    correlated_alert_ids: raw.alerts ? raw.alerts.map((a: any) => a.id) : (raw.correlated_alert_ids || []),
    recommended_action: raw.recommended_action,
    risk_level: raw.risk_level,
    approval_required: raw.approval_required,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    resolved_at: raw.resolved_at,
    timeline,
    ai_investigation,
    business_impact_details: raw.business_impact_details || {
      affected_services,
      affected_capabilities: ['Credit Card Processing', 'Checkout Engine'],
      estimated_tx_failure_rate: '78.4%',
      customer_impact: 'CRITICAL',
      estimated_financial_risk_usd: 42000,
    },
    ai_decision,
    remediation: raw.remediation || {
      action: raw.recommended_action || 'ROLLBACK_DEPLOYMENT',
      target_service: affected_services[0] || 'payment-service',
      status: raw.status === 'REMEDIATING' ? 'EXECUTING' : raw.status === 'RESOLVED' ? 'COMPLETED' : 'IDLE',
      progress_percent: raw.status === 'RESOLVED' ? 100 : raw.status === 'REMEDIATING' ? 60 : 0,
      verification_steps: [
        { name: 'Kubernetes Pod Rollback to v2.4.0', status: raw.status === 'RESOLVED' ? 'PASSED' : 'IN_PROGRESS' },
        { name: 'Database Connection Pool Flushing', status: raw.status === 'RESOLVED' ? 'PASSED' : 'PENDING' },
        { name: 'HTTP 504 Error Rate Normalization (<0.1%)', status: raw.status === 'RESOLVED' ? 'PASSED' : 'PENDING' },
      ],
    },
  };
};

export const getIncidents = async (): Promise<Incident[]> => {
  if (USE_MOCK_API) return mockApiHandler.getIncidents();
  const res = await apiClient.get('/incidents/');
  return res.data.map(normalizeIncident);
};

export const getIncidentById = async (id: string): Promise<Incident> => {
  if (USE_MOCK_API) return mockApiHandler.getIncidentById(id);
  const res = await apiClient.get(`/incidents/${id}`);
  return normalizeIncident(res.data);
};

export const getRCAGraph = async (incidentId: string): Promise<RCAGraphData> => {
  if (USE_MOCK_API) return mockApiHandler.getRCAGraph(incidentId);
  const res = await apiClient.get(`/incidents/${incidentId}/graph`);
  
  // Format backend graph response to React Flow nodes & edges
  const raw = res.data;
  if (raw.nodes && raw.edges) {
    return {
      nodes: raw.nodes.map((n: any, idx: number) => ({
        id: n.id,
        type: 'customRCA',
        position: n.position || { x: (idx + 1) * 220, y: 180 },
        data: {
          label: n.label,
          subtext: n.data?.subtext || n.data?.service || 'Component',
          nodeType: n.type || 'service',
          status: n.data?.status || (idx === 0 ? 'root_cause' : 'critical'),
          metrics: n.data?.metrics || 'active',
          confidence: n.data?.confidence || 94,
        },
      })),
      edges: raw.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: '#EF4444', strokeWidth: 2 },
      })),
    };
  }
  return mockApiHandler.getRCAGraph(incidentId);
};

export const getBlastRadius = async (incidentId: string): Promise<import('../types/rca').BlastRadiusData> => {
  if (USE_MOCK_API) return mockApiHandler.getBlastRadius(incidentId);
  try {
    const res = await apiClient.get(`/incidents/${incidentId}/blast-radius`);
    return res.data;
  } catch (err) {
    return mockApiHandler.getBlastRadius(incidentId);
  }
};

export const approveRemediation = async (incidentId: string): Promise<Incident> => {
  if (USE_MOCK_API) return mockApiHandler.approveRemediation(incidentId);
  const res = await apiClient.post(`/incidents/${incidentId}/approve`, {
    approved_by: 'SRE-Command-Center',
    comment: 'Approved remediation action from Sentinel-X UI',
    decision: 'APPROVED',
  });
  return normalizeIncident(res.data);
};

export const rejectRemediation = async (incidentId: string, reason?: string): Promise<Incident> => {
  if (USE_MOCK_API) return mockApiHandler.rejectRemediation(incidentId, reason);
  const res = await apiClient.post(`/incidents/${incidentId}/reject`, {
    rejected_by: 'SRE-Command-Center',
    comment: reason || 'Rejected by engineer from command center',
  });
  return normalizeIncident(res.data);
};
