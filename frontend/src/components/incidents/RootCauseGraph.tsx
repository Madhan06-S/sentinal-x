import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import { Card } from '../ui/Card';
import { RCAGraphData, RCANodeData } from '../../types/rca';
import { GitCommit, Database, Cpu, Server, ShieldAlert, Activity, Sparkles, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useRCAGraph } from '../../hooks/useIncidents';

const CustomRCANode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as RCANodeData;

  const nodeIcons = {
    deployment: <GitCommit className="w-4 h-4 text-blue-600" />,
    infrastructure: <Cpu className="w-4 h-4 text-amber-600" />,
    database: <Database className="w-4 h-4 text-red-600" />,
    service: <Server className="w-4 h-4 text-indigo-600" />,
    alert: <Activity className="w-4 h-4 text-orange-600" />,
    business: <ShieldAlert className="w-4 h-4 text-purple-600" />,
  };

  const statusStyles = {
    healthy: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    critical: 'border-red-300 bg-red-50 text-red-900 shadow-card',
    root_cause: 'border-blue-600 bg-blue-50 text-blue-950 shadow-card-hover ring-2 ring-blue-500/40',
    remediated: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  };

  return (
    <div
      className={clsx(
        'px-4 py-3 rounded-xl border-2 bg-white min-w-[200px] shadow-card transition-all duration-200 font-sans',
        statusStyles[nodeData.status] || 'border-[#E5E9F0] bg-white text-slate-900',
        selected && 'ring-2 ring-blue-600 scale-[1.03]'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-blue-600 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2.5 mb-1">
        <div className="p-1.5 rounded-lg bg-white border border-[#E5E9F0] shrink-0 shadow-2xs">
          {nodeIcons[nodeData.nodeType]}
        </div>
        <div>
          <h4 className="text-[12px] font-bold font-mono tracking-tight leading-tight text-slate-900">{nodeData.label}</h4>
          {nodeData.subtext && <p className="text-[10px] text-slate-500 mt-0.5">{nodeData.subtext}</p>}
        </div>
      </div>

      {nodeData.metrics && (
        <div className="mt-2 pt-1.5 border-t border-[#E5E9F0] text-[10px] font-mono flex items-center justify-between">
          <span className="text-slate-600">{nodeData.metrics}</span>
          {nodeData.confidence && (
            <span className="font-bold text-blue-700">{nodeData.confidence}% Root</span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-2.5 !h-2.5" />
    </div>
  );
};

interface RootCauseGraphProps {
  incidentId?: string;
  graphData?: RCAGraphData;
}

export const RootCauseGraph: React.FC<RootCauseGraphProps> = ({ incidentId, graphData: externalData }) => {
  const { data: fetchedData } = useRCAGraph(incidentId);
  const data = externalData || fetchedData;

  const [selectedNode, setSelectedNode] = useState<RCANodeData | null>(null);
  const nodeTypes = useMemo(() => ({ customRCA: CustomRCANode }), []);

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 bg-white border border-[#E5E9F0] rounded-[10px] shadow-card">
        <div className="flex items-center gap-2 text-slate-500 font-sans text-[13px]">
          <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Generating causal topology graph...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative rounded-[10px] overflow-hidden border border-[#E5E9F0] bg-[#F8FAFC]">
      <ReactFlow
        nodes={data.nodes}
        edges={data.edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node.data as unknown as RCANodeData)}
        fitView
      >
        <Background color="#EDF1F7" gap={20} size={1} />
        <Controls />
      </ReactFlow>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-20 w-80 p-4 bg-white border border-[#E5E9F0] rounded-[10px] shadow-dropdown animate-fade-in space-y-3 font-sans text-[12px]">
          <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-2">
            <span className="font-bold text-slate-900 uppercase font-mono text-[11px]">{selectedNode.nodeType} NODE</span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-[14px] font-bold text-blue-600 font-mono">{selectedNode.label}</p>
            <p className="text-slate-600 mt-0.5">{selectedNode.subtext}</p>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E9F0] space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Telemetry:</span>
              <span className="text-slate-900 font-semibold">{selectedNode.metrics}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status:</span>
              <span className="text-red-600 font-semibold uppercase">{selectedNode.status}</span>
            </div>
            {selectedNode.confidence && (
              <div className="flex justify-between text-blue-700 font-bold pt-1.5 border-t border-[#E5E9F0]">
                <span>Causal Probability:</span>
                <span>{selectedNode.confidence}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
