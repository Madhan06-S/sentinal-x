export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SystemHealthSummary {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  active_incidents_count: number;
  critical_incidents_count: number;
  alerts_per_minute: number;
  services_at_risk_count: number;
  auto_resolved_count: number;
  avg_resolution_time_seconds: number;
  ai_engine_status: 'ACTIVE' | 'PROCESSING' | 'IDLE';
}

export interface AIActivityItem {
  id: string;
  timestamp: string;
  action: string;
  incident_id?: string;
  agent_name?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
}
