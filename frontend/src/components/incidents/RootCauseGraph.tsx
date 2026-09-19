import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { BlastRadiusData, BlastRadiusNode as BlastNode } from '../../types/rca';
import { Server, Database, Activity, ShieldAlert, Cpu, Layers, AlertTriangle, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useBlastRadius } from '../../hooks/useIncidents';

// ErrorBoundary to catch rendering bugs in custom React Flow nodes
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class NodeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[BlastRadiusNode ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-[11px] font-mono text-red-800 shadow-xs">
          ⚠ Node render error
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom Node for Blast Radius (Guarded against missing properties)
const BlastRadiusNodeComponent: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as Record<string, any>;
  const label = (nodeData?.label as string) || 'Service';
  const status = (nodeData?.status as string) || 'healthy';
  const impact = (nodeData?.impact as string) || '';
  const ring = (nodeData?.ring as number) || 1;
  const isRoot = nodeData?.isRoot === true;

  const ringStyles: Record<number, string> = {
    0: 'border-l-4 border-l-red-600 border-red-200 bg-red-50/70 text-red-950 font-bold ring-2 ring-red-500/20',
    1: 'border-l-4 border-l-red-500 border-red-200 bg-white text-slate-900',
    2: 'border-l-4 border-l-amber-500 border-amber-200 bg-white text-slate-900',
    3: 'border-l-4 border-l-purple-500 border-purple-200 bg-white text-slate-900',
  };

  const statusBadges: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    DEGRADED: 'bg-amber-100 text-amber-700 border-amber-200',
    HEALTHY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    MAINTENANCE: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <NodeErrorBoundary>
      <div
        className={clsx(
          'px-3.5 py-2.5 rounded-xl border bg-white min-w-[180px] max-w-[220px] shadow-card hover:shadow-card-hover transition-all duration-150 font-sans',
          ringStyles[isRoot ? 0 : ring] || 'border-[#E5E9F0] bg-white text-slate-900',
          selected && 'ring-2 ring-blue-600 scale-[1.02]'
        )}
      >
        <Handle type="target" position={Position.Left} className="!bg-blue-600 !w-2 !h-2" />
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <span className="font-mono text-[12px] font-bold text-slate-900 block truncate leading-tight">
              {label}
            </span>
            {isRoot && (
              <span className="text-[9px] font-mono uppercase font-extrabold text-red-600 block mt-0.5 tracking-wider">
                Root Cause Origin
              </span>
            )}
          </div>
          <span className={clsx('px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border shrink-0', statusBadges[status.toUpperCase()] || 'bg-slate-100 text-slate-600')}>
            {status.toUpperCase()}
          </span>
        </div>

        {impact && (
          <p className="mt-1.5 pt-1.5 border-t border-[#E5E9F0] text-[10px] text-slate-600 leading-snug line-clamp-2">
            {impact}
          </p>
        )}
        <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2 !h-2" />
      </div>
    </NodeErrorBoundary>
  );
};

interface RootCauseGraphInnerProps {
  incidentId?: string;
  data?: BlastRadiusData;
}

const BlastRadiusCanvas: React.FC<RootCauseGraphInnerProps> = ({ incidentId, data: externalData }) => {
  const { data: fetchedData, isLoading } = useBlastRadius(incidentId);
  const data = externalData || fetchedData;
  const { fitView } = useReactFlow();

  const [selectedNodeData, setSelectedNodeData] = useState<Record<string, any> | null>(null);
  const nodeTypes = useMemo(() => ({ customRCA: BlastRadiusNodeComponent }), []);

  // Compute Layout: Center at (0, 0), Ring 1 at 160px, Ring 2 at 300px, Ring 3 at 440px
  const { nodes, edges, counts } = useMemo(() => {
    if (!data) return { nodes: [], edges: [], counts: { r1: 0, r2: 0, r3: 0 } };

    const rootCauseName = data.root_cause || 'payment-service';
    const ring1 = data.rings?.ring1 || [];
    const ring2 = data.rings?.ring2 || [];
    const ring3 = data.rings?.ring3 || [];

    const computedNodes: any[] = [];
    const computedEdges: any[] = [];

    // Root Cause Node at Center
    computedNodes.push({
      id: 'node-root',
      type: 'customRCA',
      position: { x: 0, y: 0 },
      data: {
        label: rootCauseName,
        status: 'CRITICAL',
        impact: 'Originating Failure Event',
        ring: 0,
        isRoot: true,
      },
    });

    // Helper to position ring nodes in a circle
    const placeRing = (items: BlastNode[], ringNum: number, radius: number, angleOffset: number = 0) => {
      const count = items.length;
      items.forEach((item, idx) => {
        const angle = (2 * Math.PI * idx) / count + angleOffset;
        const x = Math.round(radius * Math.cos(angle));
        const y = Math.round(radius * Math.sin(angle));
        const nodeId = `node-r${ringNum}-${idx}`;

        computedNodes.push({
          id: nodeId,
          type: 'customRCA',
          position: { x, y },
          data: {
            label: item.service || `service-${idx}`,
            status: item.status || 'DEGRADED',
            impact: item.impact || '',
            ring: ringNum,
            isRoot: false,
          },
        });

        // Edge connect root or inner ring
        const sourceId = ringNum === 1 ? 'node-root' : `node-r${ringNum - 1}-${idx % Math.max(1, ringNum === 2 ? ring1.length : ring2.length)}`;
        computedEdges.push({
          id: `edge-${sourceId}-${nodeId}`,
          source: sourceId,
          target: nodeId,
          animated: ringNum < 3,
          style: {
            stroke: ringNum === 1 ? '#DC2626' : ringNum === 2 ? '#D97706' : '#7C3AED',
            strokeWidth: 2,
            strokeDasharray: ringNum === 3 ? '4 4' : undefined,
          },
        });
      });
    };

    placeRing(ring1, 1, 160, 0);
    placeRing(ring2, 2, 300, Math.PI / 4);
    placeRing(ring3, 3, 440, Math.PI / 6);

    return {
      nodes: computedNodes,
      edges: computedEdges,
      counts: { r1: ring1.length, r2: ring2.length, r3: ring3.length },
    };
  }, [data]);

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 300 });
      }, 50);
    }
  }, [nodes.length, fitView]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-[#E5E9F0]">
        <Sparkles className="w-5 h-5 text-blue-600 animate-spin mb-2" />
        <span className="text-[13px] font-sans text-slate-600">Computing dependency blast radius...</span>
      </div>
    );
  }

  if (!data || nodes.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-[#E5E9F0] text-center font-sans">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Layers className="w-5 h-5" />
        </div>
        <h4 className="text-[14px] font-semibold text-slate-800">Blast radius computed after root cause identification</h4>
        <p className="text-[12px] text-slate-500 max-w-sm mt-1">
          Once the Decision Agent confirms the initial root cause, the topology propagation graph will render here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-[#E5E9F0] bg-[#F8FAFC]">
      {/* Concentric SVG Dashed Ring Circles Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
        <g transform="translate(500, 250)">
          {/* Ring 1 Circle (160px) */}
          <circle r="160" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
          {/* Ring 2 Circle (300px) */}
          <circle r="300" fill="none" stroke="#D97706" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
          {/* Ring 3 Circle (440px) */}
          <circle r="440" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.3" />
        </g>
      </svg>

      {/* Top-Right Legend Box */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs p-2.5 rounded-lg border border-[#E5E9F0] shadow-card font-sans text-[11px] space-y-1">
        <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Blast Radius Topology
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          <span className="font-mono text-slate-700">Ring 1 · {counts.r1} Direct Direct Deps</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
          <span className="font-mono text-slate-700">Ring 2 · {counts.r2} Degraded Services</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
          <span className="font-mono text-slate-700">Ring 3 · {counts.r3} Business Impact</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNodeData(node.data as Record<string, any>)}
        nodesDraggable={false}
        fitView
      >
        <Background color="#EDF1F7" gap={20} size={1} />
        <Controls />
      </ReactFlow>

      {/* Selected Node Details Floating Drawer */}
      {selectedNodeData && (
        <div className="absolute top-3 left-3 z-20 w-72 p-3.5 bg-white border border-[#E5E9F0] rounded-xl shadow-dropdown space-y-2 font-sans text-[12px]">
          <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-1.5">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">Service Detail</span>
            <button onClick={() => setSelectedNodeData(null)} className="text-slate-400 hover:text-slate-600 text-xs font-mono">
              ✕
            </button>
          </div>
          <div>
            <h5 className="font-mono text-[13px] font-bold text-slate-900">{selectedNodeData.label}</h5>
            <p className="text-slate-600 text-[11px] mt-0.5">{selectedNodeData.impact}</p>
          </div>
          <div className="pt-1.5 border-t border-[#E5E9F0] flex justify-between font-mono text-[11px]">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-slate-900">{selectedNodeData.status}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export interface RootCauseGraphProps {
  incidentId?: string;
  data?: BlastRadiusData;
  graphData?: any;
}

export const RootCauseGraph: React.FC<RootCauseGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <BlastRadiusCanvas {...props} />
    </ReactFlowProvider>
  );
};
