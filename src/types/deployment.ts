export type DeploymentStatus = 'SUCCESSFUL' | 'FAILED' | 'ROLLED_BACK' | 'IN_PROGRESS' | 'SUSPECTED';

export interface Deployment {
  id: string;
  service: string;
  version: string;
  commit_hash: string;
  environment: string;
  author: string;
  timestamp: string;
  status: DeploymentStatus;
  change_summary: string;
  linked_incident_id?: string;
}
