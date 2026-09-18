import React from 'react';
import { ServiceInfo } from '../../types/service';
import { Card } from '../ui/Card';
import { Server, Activity, Cpu, HardDrive, AlertTriangle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceGridProps {
  services?: ServiceInfo[];
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services = [] }) => {
  const statusColors = {
    HEALTHY: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    DEGRADED: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    CRITICAL: 'text-red-400 bg-red-950/60 border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    MAINTENANCE: 'text-slate-400 bg-slate-800 border-slate-700',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {services.map((srv) => (
        <Card key={srv.id} hoverEffect className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-slate-100">{srv.name}</h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{srv.owner_team} • {srv.version}</p>
              </div>
            </div>
            <span className={clsx('px-2.5 py-1 rounded-full text-xs font-mono font-semibold border', statusColors[srv.status])}>
              {srv.status}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-400" /> CPU Load
              </span>
              <span className="text-slate-100 font-bold block">{srv.metrics.cpu_percent}%</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-indigo-400" /> Memory
              </span>
              <span className="text-slate-100 font-bold block">{srv.metrics.memory_percent}%</span>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-400" /> Error Rate
              </span>
              <span className={srv.metrics.error_rate_percent > 1 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {srv.metrics.error_rate_percent}%
              </span>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> p99 Latency
              </span>
              <span className="text-slate-100 font-bold block">{srv.metrics.p99_latency_ms}ms</span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Dependencies: {srv.dependencies.length}</span>
            {srv.active_alerts_count > 0 && (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {srv.active_alerts_count} Active Alerts
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
