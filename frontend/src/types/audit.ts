export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actor_type: 'AI_ENGINE' | 'ENGINEER' | 'SYSTEM';
  action: string;
  resource: string;
  incident_id?: string;
  result: 'SUCCESS' | 'FAILURE' | 'PENDING';
  details?: Record<string, any>;
}
