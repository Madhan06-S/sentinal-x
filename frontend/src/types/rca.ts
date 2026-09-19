export type RCANodeType = 'deployment' | 'service' | 'database' | 'infrastructure' | 'alert' | 'business';

export interface RCANodeData {
  label: string;
  subtext?: string;
  nodeType: RCANodeType;
  status: 'healthy' | 'warning' | 'critical' | 'root_cause' | 'remediated';
  metrics?: string;
  confidence?: number;
  impact?: string;
  ring?: number;
  metadata?: Record<string, any>;
  [key: string]: unknown; // Index signature for React Flow compatibility
}

export interface RCAGraphData {
  nodes: Array<{
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: RCANodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: Record<string, any>;
  }>;
}

export interface BlastRadiusNode {
  service: string;
  status: string;
  impact: string;
}

export interface BlastRadiusRings {
  ring1: BlastRadiusNode[];
  ring2: BlastRadiusNode[];
  ring3: BlastRadiusNode[];
}

export interface BlastRadiusData {
  root_cause: string;
  rings: BlastRadiusRings;
}
