export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'CORRELATED' | 'SILENCED' | 'RESOLVED';

export interface Alert {
  id: string;
  source: string;
  service: string;
  alert_type: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  status: AlertStatus;
  incident_id?: string;
}

export interface AlertFilters {
  search?: string;
  severity?: AlertSeverity | 'ALL';
  service?: string | 'ALL';
  source?: string | 'ALL';
  status?: AlertStatus | 'ALL';
}
