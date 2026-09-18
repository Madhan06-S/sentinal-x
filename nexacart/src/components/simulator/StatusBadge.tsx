import React from 'react';
import { SystemHealthStatus } from '../../types/incident';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: SystemHealthStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getConfig = () => {
    switch (status) {
      case 'HEALTHY':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'HEALTHY',
          sub: 'All systems operating normally',
        };
      case 'DEGRADED':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500 animate-pulse',
          label: 'DEGRADED',
          sub: 'Performance anomaly detected',
        };
      case 'CRITICAL':
        return {
          icon: XCircle,
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500 animate-ping',
          label: 'CRITICAL',
          sub: 'High error rate / pool exhaustion',
        };
      case 'RECOVERING':
        return {
          icon: RefreshCw,
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          dot: 'bg-indigo-500 animate-spin',
          label: 'RECOVERING',
          sub: 'Applying remediation rollback',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold border ${config.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border font-mono ${config.bg}`}>
      <Icon className={`w-4 h-4 ${status === 'RECOVERING' ? 'animate-spin' : ''}`} />
      <div>
        <div className="text-xs font-bold tracking-wider">{config.label}</div>
        <div className="text-[10px] opacity-80 font-sans">{config.sub}</div>
      </div>
    </div>
  );
};
