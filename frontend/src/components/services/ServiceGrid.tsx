import React, { useState } from 'react';
import { ServiceInfo, ServiceHealthStatus } from '../../types/service';
import { Card } from '../ui/Card';
import { Server, Activity, Cpu, HardDrive, AlertTriangle, Clock, X, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface ServiceGridProps {
  services?: ServiceInfo[];
}

// Generate mock historical metric data for sparklines/detail view
const generateMetricHistory = (baseCpu: number, baseMem: number, baseLat: number) => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 5}m ago`,
    cpu: Math.min(100, Math.max(10, baseCpu + Math.floor(Math.sin(i) * 15))),
    memory: Math.min(100, Math.max(10, baseMem + Math.floor(Math.cos(i) * 8))),
    latency: Math.max(5, baseLat + Math.floor(Math.sin(i * 2) * 25)),
    errorRate: Math.max(0, parseFloat((Math.sin(i) * 1.5).toFixed(2))),
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

  const detailHistory = selectedService
    ? generateMetricHistory(
        selectedService.metrics.cpu_percent,
        selectedService.metrics.memory_percent,
        selectedService.metrics.p99_latency_ms
      )
    : [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            onClick={() => setSelectedService(srv)}
            className={`bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover p-4 cursor-pointer transition-all ${borderAccent[srv.status]} flex flex-col justify-between space-y-3`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{srv.name}</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {srv.owner_team} • {srv.version}
                  </p>
                </div>
                <StatusBadge status={statusVariant[srv.status]} text={srv.status} />
              </div>

              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 mb-3">
                {srv.category}
              </div>

              {/* Metrics summary */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-100 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-blue-600" /> CPU</span>
                    <span className="font-bold text-slate-900">{srv.metrics.cpu_percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${srv.metrics.memory_percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Error Rate</span>
                  <span className={srv.metrics.error_rate_percent > 1 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {srv.metrics.error_rate_percent}%
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-200 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">p99 Latency</span>
                  <span className="font-bold text-slate-900">{srv.metrics.p99_latency_ms}ms</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] font-mono text-slate-500">
              <span className="truncate">Deps: {srv.dependencies?.length ? srv.dependencies.join(', ') : 'None'}</span>
              {srv.active_alerts_count > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 shrink-0">
                  <AlertTriangle className="w-3 h-3" /> {srv.active_alerts_count}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Slide-Over Drawer */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-mono text-base font-bold text-slate-900">{selectedService.name}</h2>
                  <p className="text-xs font-mono text-slate-500">
                    Team: {selectedService.owner_team} • Version: {selectedService.version}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={statusVariant[selectedService.status]} text={selectedService.status} />
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono">
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

              {/* Charts Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                  Live Service Telemetry (Last 60 mins)
                </h3>

                {/* CPU & Memory Area Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono mb-3">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-600" /> CPU & Memory Load (%)
                    </span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-blue-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> CPU</span>
                      <span className="flex items-center gap-1 text-indigo-600"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Memory</span>
                    </div>
                  </div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={detailHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#0F172A', fontSize: '11px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                        />
                        <Area type="monotone" dataKey="cpu" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                        <Area type="monotone" dataKey="memory" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Latency & Error Rate Area Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono mb-3">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" /> p99 Latency (ms) & Error Rate
                    </span>
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={detailHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', color: '#0F172A', fontSize: '11px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                        />
                        <Area type="monotone" dataKey="latency" stroke="#D97706" fill="#D97706" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Topology / Dependencies */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                  Upstream & Downstream Dependencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedService.dependencies?.length ? (
                    selectedService.dependencies.map((dep) => (
                      <span
                        key={dep}
                        className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-medium flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-blue-600" /> {dep}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">No direct upstream/downstream dependencies registered.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close Drawer
              </button>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 font-mono">
                  <Activity className="w-3.5 h-3.5" /> Trigger Health Check
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

