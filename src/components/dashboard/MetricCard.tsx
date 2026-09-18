import React from 'react';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isNegativeTrend?: boolean;
  icon: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'healthy' | 'ai';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isNegativeTrend = false,
  icon,
  variant = 'default',
}) => {
  const borderColors = {
    default: 'hover:border-slate-700',
    critical: 'border-red-900/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.08)]',
    warning: 'border-amber-900/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.08)]',
    healthy: 'border-emerald-900/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]',
    ai: 'border-purple-900/50 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.12)]',
  };

  const iconColors = {
    default: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40',
    critical: 'text-red-400 bg-red-950/60 border-red-800/40',
    warning: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
    healthy: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
    ai: 'text-purple-300 bg-purple-950/60 border-purple-800/40',
  };

  return (
    <Card className={clsx('transition-all duration-200', borderColors[variant])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className={clsx('w-9 h-9 rounded-lg border flex items-center justify-center', iconColors[variant])}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">{value}</span>
        {change && (
          <span
            className={clsx(
              'text-xs font-mono font-medium px-1.5 py-0.5 rounded',
              isNegativeTrend ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
            )}
          >
            {change}
          </span>
        )}
      </div>
    </Card>
  );
};
