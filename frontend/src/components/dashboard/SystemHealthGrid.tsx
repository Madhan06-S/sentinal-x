import React from 'react';
import { Card } from '../ui/Card';
import { ServiceInfo } from '../../types/service';
import { Server } from 'lucide-react';

interface SystemHealthGridProps {
  services?: ServiceInfo[];
}

export const SystemHealthGrid: React.FC<SystemHealthGridProps> = ({ services = [] }) => {
  const dotColors = {
    HEALTHY: 'bg-emerald-600',
    DEGRADED: 'bg-amber-600',
    CRITICAL: 'bg-red-600',
    MAINTENANCE: 'bg-slate-400',
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          <span className="text-[15px] font-bold text-slate-900 font-sans">System Infrastructure Health</span>
        </div>
      }
      subtitle="Microservice status & active telemetry metrics"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="p-3.5 bg-white border border-[#E5E9F0] rounded-[10px] shadow-card flex items-center justify-between hover:shadow-card-hover transition-all font-sans"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColors[srv.status]}`} />
              <div className="min-w-0">
                <h5 className="text-[13px] font-bold text-slate-900 font-mono tracking-tight truncate">{srv.name}</h5>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Lat: {srv.metrics.p99_latency_ms}ms | Err: {srv.metrics.error_rate_percent}%
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#F1F4F9] border border-[#E5E9F0] text-slate-600 font-semibold shrink-0 ml-2">
              {srv.category}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
