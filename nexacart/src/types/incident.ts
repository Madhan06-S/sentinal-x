export type SystemHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'RECOVERING';

export type IncidentErrorCode = 'DEP-001' | 'MEM-101' | 'DB-104' | 'API-201' | 'PAY-301';

export type IncidentSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type IncidentEventType =
  | 'deployment'
  | 'resource_alert'
  | 'database_error'
  | 'api_degradation'
  | 'payment_failure'
  | 'remediation_event';

export interface StructuredIncidentEvent {
  timestamp: string;
  service: string;
  event_type: IncidentEventType;
  severity: IncidentSeverity;
  error_code: IncidentErrorCode;
  message: string;
  environment: string;
  metadata: Record<string, any>;
}

export type AllowedRemediationAction =
  | 'ROLLBACK_DEPLOYMENT'
  | 'RESTART_SERVICE'
  | 'RECOVER_DATABASE'
  | 'RESET_PAYMENT_SERVICE';

export interface RemediationRequest {
  action: AllowedRemediationAction;
  target_service?: string;
  triggered_by?: string;
}

export interface RemediationResponse {
  status: 'REMEDIATION_RECEIVED' | 'REMEDIATION_SUCCESS' | 'REJECTED';
  action: string;
  message: string;
  timestamp: string;
  metrics_after?: SystemMetrics;
}

export interface SystemMetrics {
  memory_usage: number;          // percentage e.g. 42 or 94
  db_connections: number;        // active out of 100
  max_connections: number;       // default 100
  api_latency: number;           // seconds e.g. 0.18 or 4.8
  payment_failure_rate: number;  // percentage e.g. 0.8 or 31.0
}

export interface IncidentTimelineStep {
  id: number;
  label: string;
  code: IncidentErrorCode;
  phase: string;
  delaySec: number;
  status: 'pending' | 'active' | 'completed';
  timestamp?: string;
  description: string;
}
