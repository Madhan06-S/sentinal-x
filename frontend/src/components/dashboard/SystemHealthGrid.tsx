import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ServiceInfo } from '../../types/service';
import { Server, ArrowRight } from 'lucide-react';

interface SystemHealthGridProps {
  services?: ServiceInfo[];
}

export const SystemHealthGrid: React.FC<SystemHealthGridProps> = ({ services = [] }) => {
  const dotColors = {
    HEALTHY: 'bg-emerald-500 shadow-emerald-200',
    DEGRADED: 'bg-amber-500 shadow-amber-200',
    CRITICAL: 'bg-red-500 shadow-red-200',
    MAINTENANCE: 'bg-slate-400 shadow-slate-200',
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2 font-sans">
          <Server className="w-4 h-4 text-blue-600" />
          <span className="text-[14px] font-bold text-slate-900">System Infrastructure Health</span>
        </div>
      }
      subtitle="Microservice status and P99 latency overview"
      action={
        <Link
          to="/services"
          className="text-[12px] text-blue-600 hover:text-blue-700 font-mono font-medium flex items-center gap-1"
        >
          View All Services ({services.length}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 font-sans no-scrollbar">
        {services.map((srv) => (
          <Link
            key={srv.id}
            to="/services"
            className="flex items-center gap-2.5 px-3 py-2 bg-white border border-[#E5E9F0] rounded-lg shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all shrink-0 group cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[srv.status]}`} />
            <span className="text-[12px] font-semibold text-slate-800 font-mono group-hover:text-blue-600 transition-colors">
              {srv.name}
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              {srv.metrics.p99_latency_ms}ms
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
};
