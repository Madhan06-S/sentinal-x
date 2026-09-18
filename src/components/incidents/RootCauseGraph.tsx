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
import { GitCommit, Database, Cpu, Server, ShieldAlert, CheckCircle2, Activity, Info } from 'lucide-react';
import { clsx } from 'clsx';

// Custom dark styled node component for React Flow
const CustomRCANode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as RCANodeData;

  const nodeIcons = {
    deployment: <GitCommit className="w-4 h-4 text-cyan-400" />,
    infrastructure: <Cpu className="w-4 h-4 text-amber-400" />,
    database: <Database className="w-4 h-4 text-red-400" />,
    service: <Server className="w-4 h-4 text-indigo-400" />,
    alert: <Activity className="w-4 h-4 text-orange-400" />,
    business: <ShieldAlert className="w-4 h-4 text-purple-400" />,
  };

  const statusStyles = {
    healthy: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
    warning: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
    critical: 'border-red-500/60 bg-red-950/40 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    root_cause: 'border-purple-500/70 bg-purple-950/50 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/50',
    remediated: 'border-emerald-500/70 bg-emerald-950/40 text-emerald-200',
  };

  return (
    <div
      className={clsx(
        'px-4 py-3 rounded-xl border-2 backdrop-blur-md min-w-[200px] transition-all duration-200',
        statusStyles[nodeData.status] || 'border-slate-800 bg-slate-900 text-slate-200',
        selected && 'ring-2 ring-indigo-400 scale-[1.03]'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2.5 mb-1">
        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 shrink-0">
          {nodeIcons[nodeData.nodeType]}
        </div>
        <div>
          <h4 className="text-xs font-bold font-mono tracking-tight leading-tight">{nodeData.label}</h4>
          {nodeData.subtext && <p className="text-[10px] opacity-80 mt-0.5">{nodeData.subtext}</p>}
        </div>
      </div>

      {nodeData.metrics && (
        <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono flex items-center justify-between opacity-90">
          <span>{nodeData.metrics}</span>
          {nodeData.confidence && (
            <span className="font-bold text-purple-300">{nodeData.confidence}% Root</span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  );
};

interface RootCauseGraphProps {
  graphData?: RCAGraphData;
}

export const RootCauseGraph: React.FC<RootCauseGraphProps> = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState<RCANodeData | null>(null);

  const nodeTypes = useMemo(() => ({ customRCA: CustomRCANode }), []);

  if (!graphData) return null;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-100">Interactive Causal Graph (RCA)</span>
          <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800">
            React Flow Dynamic Topology
          </span>
        </div>
      }
      subtitle="AI-isolated dependency propagation chain from root trigger to business failure"
    >
      <div className="h-[420px] w-full relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <ReactFlow
          nodes={graphData.nodes}
          edges={graphData.edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node.data as unknown as RCANodeData)}
          fitView
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls />
        </ReactFlow>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 p-4 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-100 uppercase">{selectedNode.nodeType} NODE</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-300">{selectedNode.label}</p>
              <p className="text-slate-400 mt-1">{selectedNode.subtext}</p>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Telemetry:</span>
                <span className="text-slate-200 font-semibold">{selectedNode.metrics}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-red-400 font-semibold uppercase">{selectedNode.status}</span>
              </div>
              {selectedNode.confidence && (
                <div className="flex justify-between text-purple-400 font-bold pt-1 border-t border-slate-800">
                  <span>AI Causal Probability:</span>
                  <span>{selectedNode.confidence}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
