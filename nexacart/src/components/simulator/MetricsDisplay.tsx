import React from 'react';
import { SystemMetrics } from '../../types/incident';
import { Cpu, Database, Gauge, AlertOctagon } from 'lucide-react';

interface MetricsDisplayProps {
  metrics: SystemMetrics;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  const isMemCritical = metrics.memory_usage >= 85;
  const isDbCritical = metrics.db_connections >= 90;
  const isLatencyCritical = metrics.api_latency >= 2.0;
  const isPaymentCritical = metrics.payment_failure_rate >= 10.0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Memory Usage */}
      <div className={`p-4 rounded-xl border transition-all ${
        isMemCritical
          ? 'bg-rose-50/50 border-rose-200 text-rose-950'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Cpu className={`w-3.5 h-3.5 ${isMemCritical ? 'text-rose-600' : 'text-slate-400'}`} />
            Memory Usage
          </span>
          <span className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
            isMemCritical ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isMemCritical ? 'MEM-101' : 'Normal'}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight">
            {metrics.memory_usage}%
          </span>
          <span className="text-xs text-slate-400 font-sans">/ 100%</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isMemCritical ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(metrics.memory_usage, 100)}%` }}
          />
        </div>
      </div>

      {/* Metric 2: DB Connection Pool */}
      <div className={`p-4 rounded-xl border transition-all ${
        isDbCritical
          ? 'bg-rose-50/50 border-rose-200 text-rose-950'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Database className={`w-3.5 h-3.5 ${isDbCritical ? 'text-rose-600' : 'text-slate-400'}`} />
            DB Connections
          </span>
          <span className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
            isDbCritical ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isDbCritical ? 'DB-104' : 'Normal'}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight">
            {metrics.db_connections}
          </span>
          <span className="text-xs text-slate-400 font-sans">/ {metrics.max_connections}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isDbCritical ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${(metrics.db_connections / metrics.max_connections) * 100}%` }}
          />
        </div>
      </div>

      {/* Metric 3: API Latency */}
      <div className={`p-4 rounded-xl border transition-all ${
        isLatencyCritical
          ? 'bg-rose-50/50 border-rose-200 text-rose-950'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Gauge className={`w-3.5 h-3.5 ${isLatencyCritical ? 'text-rose-600' : 'text-slate-400'}`} />
            API P99 Latency
          </span>
          <span className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
            isLatencyCritical ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isLatencyCritical ? 'API-201' : 'Normal'}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight">
            {metrics.api_latency >= 1.0
              ? `${metrics.api_latency.toFixed(1)}s`
              : `${Math.round(metrics.api_latency * 1000)}ms`}
          </span>
          <span className="text-xs text-slate-400 font-sans">sla &lt;1.0s</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isLatencyCritical ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min((metrics.api_latency / 5.0) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Metric 4: Payment Errors */}
      <div className={`p-4 rounded-xl border transition-all ${
        isPaymentCritical
          ? 'bg-rose-50/50 border-rose-200 text-rose-950'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <AlertOctagon className={`w-3.5 h-3.5 ${isPaymentCritical ? 'text-rose-600' : 'text-slate-400'}`} />
            Payment Failure Rate
          </span>
          <span className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
            isPaymentCritical ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isPaymentCritical ? 'PAY-301' : 'Normal'}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tracking-tight">
            {metrics.payment_failure_rate.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400 font-sans">sla &lt;1.0%</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isPaymentCritical ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min((metrics.payment_failure_rate / 35.0) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
