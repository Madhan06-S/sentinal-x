import React from 'react';
import { Card } from '../ui/Card';
import { ServiceInfo } from '../../types/service';
import { Server, Activity } from 'lucide-react';

interface SystemHealthGridProps {
  services?: ServiceInfo[];
}

export const SystemHealthGrid: React.FC<SystemHealthGridProps> = ({ services = [] }) => {
  const dotColors = {
    HEALTHY: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    DEGRADED: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse',
    CRITICAL: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse',
    MAINTENANCE: 'bg-slate-400',
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <span className="text-base font-bold text-slate-100">System Infrastructure Health</span>
        </div>
      }
      subtitle="Microservice status & active telemetry metrics"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColors[srv.status]}`} />
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono tracking-tight">{srv.name}</h5>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Latency: {srv.metrics.p99_latency_ms}ms | Err: {srv.metrics.error_rate_percent}%
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-medium">
              {srv.category}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
