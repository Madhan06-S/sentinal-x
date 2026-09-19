import React, { useState } from 'react';
import { ServiceInfo, ServiceHealthStatus } from '../../types/service';
import { Cpu, HardDrive, AlertTriangle, X, Flame, Activity } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ServiceGridProps {
  services?: ServiceInfo[];
}

// Sparkline tick data generator per service
const generateSparkline = (baseLat: number, isBurning: boolean) => {
  return Array.from({ length: 10 }, (_, i) => ({
    time: `${i * 2}m`,
    latency: Math.max(10, baseLat + Math.sin(i) * (isBurning ? 45 : 12)),
  }));
};

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services = [] }) => {
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);

  const borderAccent: Record<ServiceHealthStatus, string> = {
    HEALTHY: 'border-l-4 border-l-emerald-600',
    DEGRADED: 'border-l-4 border-l-amber-500',
    CRITICAL: 'border-l-4 border-l-red-600',
    MAINTENANCE: 'border-l-4 border-l-slate-400',
  };

  const statusVariant: Record<ServiceHealthStatus, 'success' | 'warning' | 'danger' | 'info'> = {
    HEALTHY: 'success',
    DEGRADED: 'warning',
    CRITICAL: 'danger',
    MAINTENANCE: 'info',
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-sans">
        {services.map((srv) => {
          const isSloBurning = srv.metrics.error_rate_percent > 0.5 || srv.status !== 'HEALTHY';
          const sparklineData = generateSparkline(srv.metrics.p99_latency_ms, isSloBurning);

          return (
            <div
              key={srv.id}
              onClick={() => setSelectedService(srv)}
              className={`bg-white rounded-xl border border-[#E5E9F0] shadow-card hover:shadow-card-hover p-4 cursor-pointer transition-all ${borderAccent[srv.status]} flex flex-col justify-between space-y-3`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[13px] font-bold text-slate-900">{srv.name}</span>
                      {isSloBurning && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-mono font-semibold border border-red-200"
                          title="SLO Burn Rate Active (>0.5% errors)"
                        >
                          <Flame className="w-3 h-3 text-red-600 animate-pulse" /> SLO Burn
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {srv.owner_team} • {srv.version}
                    </p>
                  </div>
                  <StatusBadge status={statusVariant[srv.status]} text={srv.status} size="sm" />
                </div>

                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 mb-2">
                  {srv.category}
                </div>

                {/* Dense Sparkline Telemetry Chart */}
                <div className="h-16 w-full bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg p-1 my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                      <defs>
                        <linearGradient id={`sparkGrad-${srv.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isSloBurning ? '#DC2626' : '#2563EB'} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={isSloBurning ? '#DC2626' : '#2563EB'} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="latency"
                        stroke={isSloBurning ? '#DC2626' : '#2563EB'}
                        strokeWidth={1.5}
                        fill={`url(#sparkGrad-${srv.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] rounded-lg p-2 border border-[#E5E9F0] font-mono text-[11px]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-blue-600" /> CPU</span>
                      <span className="font-bold text-slate-900">{srv.metrics.cpu_percent}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${srv.metrics.cpu_percent > 85 ? 'bg-red-600' : 'bg-blue-600'}`}
                        style={{ width: `${srv.metrics.cpu_percent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-indigo-600" /> MEM</span>
                      <span className="font-bold text-slate-900">{srv.metrics.memory_percent}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${srv.metrics.memory_percent}%` }} />
                    </div>
                  </div>

                  <div className="pt-1 border-t border-[#E5E9F0] flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Error Rate</span>
                    <span className={srv.metrics.error_rate_percent > 0.5 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {srv.metrics.error_rate_percent}%
                    </span>
                  </div>

                  <div className="pt-1 border-t border-[#E5E9F0] flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">p99 Latency</span>
                    <span className="font-bold text-slate-900">{srv.metrics.p99_latency_ms}ms</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-[#E5E9F0] text-[10px] font-mono text-slate-500">
                <span className="truncate">Deps: {srv.dependencies?.length ? srv.dependencies.join(', ') : 'None'}</span>
                {srv.active_alerts_count > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200 shrink-0">
                    <AlertTriangle className="w-3 h-3" /> {srv.active_alerts_count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Drawer */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs font-sans">
          <div
            className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-[#E5E9F0] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-mono text-[16px] font-bold text-slate-900">{selectedService.name}</h2>
                  <p className="text-[11px] font-mono text-slate-500">
                    Team: {selectedService.owner_team} • Version: {selectedService.version}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#E5E9F0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 bg-[#F7F8FA]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-[#E5E9F0] text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">CATEGORY</span>
                  <span className="font-semibold text-slate-800">{selectedService.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">RPS</span>
                  <span className="font-semibold text-slate-800">{selectedService.metrics.requests_per_sec || 240} req/s</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">LAST DEPLOYED</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedService.last_deployed_at || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ACTIVE ALERTS</span>
                  <span className={`font-semibold ${selectedService.active_alerts_count > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedService.active_alerts_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
