import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
} from '@xyflow/react';
import { Card } from '../ui/Card';
import { Network, Server, Database, Cpu, Activity, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export type ServiceNodeState = 'healthy' | 'warning' | 'critical' | 'resolved';

export interface ServiceNodeData {
  label: string;
  kind: 'api' | 'db' | 'cache' | 'queue' | 'svc';
  state: ServiceNodeState;
  healthPercent: number;
  latencyMs: number;
  errorRate: number;
  [key: string]: unknown;
}

// Custom Node for Causal Graph
const CausalServiceNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as ServiceNodeData;

  const stateStyles = {
    healthy: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    warning: 'border-amber-500/50 bg-amber-950/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    critical: 'border-red-500 bg-red-950/40 text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.4)] ring-2 ring-red-500/60 animate-pulse',
    resolved: 'border-emerald-400 bg-emerald-950/50 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400',
  };

  const statusDots = {
    healthy: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    warning: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    critical: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-ping',
    resolved: 'bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,1)]',
  };

  const kindIcons = {
    api: <Server className="w-3.5 h-3.5 text-cyan-400" />,
    db: <Database className="w-3.5 h-3.5 text-purple-400" />,
    cache: <Cpu className="w-3.5 h-3.5 text-amber-400" />,
    queue: <Layers className="w-3.5 h-3.5 text-indigo-400" />,
    svc: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
  };

  return (
    <div
      className={cn(
        'px-3.5 py-2.5 rounded-xl border backdrop-blur-md min-w-[180px] transition-all duration-300',
        stateStyles[nodeData.state],
        selected && 'ring-2 ring-cyan-400 scale-[1.03]'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-zinc-900/80 border border-zinc-700/60">
            {kindIcons[nodeData.kind] || <Server className="w-3.5 h-3.5 text-cyan-400" />}
          </span>
          <span className="font-mono text-xs font-bold tracking-tight">{nodeData.label}</span>
        </div>
        <span className={cn('w-2 h-2 rounded-full shrink-0', statusDots[nodeData.state])} />
      </div>

      {/* Mini Health Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
          <span>Health</span>
          <span className="font-bold text-zinc-200">{nodeData.healthPercent}%</span>
        </div>
        <div className="w-full bg-zinc-950/80 rounded-full h-1.5 overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              nodeData.healthPercent > 80
                ? 'bg-emerald-400'
                : nodeData.healthPercent > 40
                ? 'bg-amber-400'
                : 'bg-red-500'
            )}
            style={{ width: `${nodeData.healthPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-1.5 pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span>{nodeData.latencyMs}ms</span>
        <span className={nodeData.errorRate > 5 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
          {nodeData.errorRate}% err
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2.5 !h-2.5" />
    </div>
  );
};

interface CausalGraphCanvasProps {
  serviceStates?: Record<string, ServiceNodeState>;
  onSelectNode?: (nodeId: string) => void;
}

export const CausalGraphCanvas: React.FC<CausalGraphCanvasProps> = ({
  serviceStates = {},
  onSelectNode,
}) => {
  const nodeTypes = useMemo(() => ({ causalService: CausalServiceNode }), []);

  // 8 Canonical Microservices
  const initialNodes: Node[] = useMemo(() => {
    const states: Record<string, ServiceNodeState> = {
      'user-db': serviceStates['user-db'] || 'healthy',
      'auth-service': serviceStates['auth-service'] || 'healthy',
      'payment-api': serviceStates['payment-api'] || 'critical',
      'payment-db': serviceStates['payment-db'] || 'critical',
      'cache-redis': serviceStates['cache-redis'] || 'healthy',
      'order-api': serviceStates['order-api'] || 'warning',
      'checkout-queue': serviceStates['checkout-queue'] || 'warning',
      'notification-svc': serviceStates['notification-svc'] || 'healthy',
    };

    return [
      {
        id: 'user-db',
        type: 'causalService',
        position: { x: 40, y: 60 },
        data: { label: 'user-db', kind: 'db', state: states['user-db'], healthPercent: 98, latencyMs: 4, errorRate: 0.0 },
      },
      {
        id: 'auth-service',
        type: 'causalService',
        position: { x: 260, y: 60 },
        data: { label: 'auth-service', kind: 'svc', state: states['auth-service'], healthPercent: 96, latencyMs: 24, errorRate: 0.1 },
      },
      {
        id: 'payment-api',
        type: 'causalService',
        position: { x: 480, y: 60 },
        data: { label: 'payment-api', kind: 'api', state: states['payment-api'], healthPercent: 12, latencyMs: 12400, errorRate: 78.4 },
      },
      {
        id: 'payment-db',
        type: 'causalService',
        position: { x: 700, y: 60 },
        data: { label: 'payment-db', kind: 'db', state: states['payment-db'], healthPercent: 4, latencyMs: 8900, errorRate: 98.0 },
      },
      {
        id: 'cache-redis',
        type: 'causalService',
        position: { x: 40, y: 220 },
        data: { label: 'cache-redis', kind: 'cache', state: states['cache-redis'], healthPercent: 99, latencyMs: 2, errorRate: 0.0 },
      },
      {
        id: 'order-api',
        type: 'causalService',
        position: { x: 260, y: 220 },
        data: { label: 'order-api', kind: 'api', state: states['order-api'], healthPercent: 62, latencyMs: 480, errorRate: 3.2 },
      },
      {
        id: 'checkout-queue',
        type: 'causalService',
        position: { x: 480, y: 220 },
        data: { label: 'checkout-queue', kind: 'queue', state: states['checkout-queue'], healthPercent: 54, latencyMs: 850, errorRate: 14.1 },
      },
      {
        id: 'notification-svc',
        type: 'causalService',
        position: { x: 700, y: 220 },
        data: { label: 'notification-svc', kind: 'svc', state: states['notification-svc'], healthPercent: 95, latencyMs: 42, errorRate: 0.0 },
      },
    ];
  }, [serviceStates]);

  // Edges with dependency failure color mapping
  const edges: Edge[] = useMemo(() => {
    const isFailed = (id: string) => serviceStates[id] === 'critical' || serviceStates[id] === 'warning';

    return [
      { id: 'e-user-auth', source: 'user-db', target: 'auth-service', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2 } },
      { id: 'e-auth-payment', source: 'auth-service', target: 'payment-api', animated: true, style: { stroke: isFailed('payment-api') ? '#EF4444' : '#22d3ee', strokeWidth: isFailed('payment-api') ? 3 : 2 } },
      { id: 'e-payment-db', source: 'payment-api', target: 'payment-db', animated: true, style: { stroke: '#EF4444', strokeWidth: 3 } },
      { id: 'e-cache-order', source: 'cache-redis', target: 'order-api', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2 } },
      { id: 'e-order-checkout', source: 'order-api', target: 'checkout-queue', animated: true, style: { stroke: isFailed('checkout-queue') ? '#F59E0B' : '#22d3ee', strokeWidth: 2 } },
      { id: 'e-checkout-notify', source: 'checkout-queue', target: 'notification-svc', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2 } },
      { id: 'e-payment-checkout', source: 'payment-api', target: 'checkout-queue', animated: true, style: { stroke: '#EF4444', strokeWidth: 3 } },
    ];
  }, [serviceStates]);

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <span className="text-base font-bold text-zinc-100 font-sans">
              Microservices Causal Dependency Canvas
            </span>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Live Topology Graph (8 Services)
          </span>
        </div>
      }
      subtitle="React Flow force-directed dependency model tracking fault propagation"
    >
      <div className="h-[360px] w-full relative rounded-xl overflow-hidden border border-zinc-800 bg-[#050810]">
        <ReactFlow
          nodes={initialNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => onSelectNode && onSelectNode(node.id)}
          fitView
        >
          <Background color="#1E293B" gap={24} size={1} />
          <Controls />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg backdrop-blur-md text-[10px] font-mono text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Healthy
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Warning
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical Root
          </div>
        </div>
      </div>
    </Card>
  );
};
