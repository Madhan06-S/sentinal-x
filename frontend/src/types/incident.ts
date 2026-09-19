import { AlertSeverity } from './alert';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'AWAITING_APPROVAL'
  | 'REMEDIATING'
  | 'VERIFYING'
  | 'RESOLVED'
  | 'FAILED';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'DEPLOYMENT' | 'METRIC_SPIKE' | 'ALERT' | 'AI_EVENT' | 'HUMAN_ACTION' | 'REMEDIATION' | 'VERIFICATION';
  metadata?: Record<string, any>;
}

export interface AIEvidenceItem {
  id: string;
  type: 'metric' | 'log' | 'event' | 'correlation';
  description: string;
  verified: boolean;
  score?: number;
}

export interface AIInvestigation {
  probable_root_cause: string;
  confidence: number;
  evidence: AIEvidenceItem[];
  hypothesis: string;
  validation_steps: string[];
  conclusion: string;
  analyzed_at: string;
}

export interface BusinessImpact {
  affected_services: string[];
  affected_capabilities: string[];
  estimated_tx_failure_rate: string;
  customer_impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimated_financial_risk_usd: number;
}

export interface AIDecision {
  recommended_action: string;
  target_service: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approval_required: boolean;
  reason: string;
  parameters?: Record<string, any>;
  decided_at: string;
}

export interface RemediationStatus {
  action: string;
  target_service: string;
  status: 'IDLE' | 'EXECUTING' | 'VERIFYING' | 'COMPLETED' | 'FAILED';
  started_at?: string;
  completed_at?: string;
  progress_percent: number;
  verification_steps: {
    name: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
    details?: string;
  }[];
}

export interface Incident {
  incident_id: string;
  title: string;
  status: IncidentStatus;
  severity: AlertSeverity;
  affected_services: string[];
  business_impact_summary?: string;
  confidence?: number;
  root_cause?: string;
  correlated_alert_ids: string[];
  recommended_action?: string;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approval_required?: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  // Detailed properties
  timeline?: TimelineEvent[];
  ai_investigation?: AIInvestigation;
  business_impact_details?: BusinessImpact;
  ai_decision?: AIDecision;
  remediation?: RemediationStatus;
}

export interface IncidentFilters {
  search?: string;
  severity?: AlertSeverity | 'ALL';
  status?: IncidentStatus | 'ALL';
  service?: string | 'ALL';
}
