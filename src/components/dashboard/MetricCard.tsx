import React from 'react';
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
  const iconContainerStyles = {
    default: 'bg-blue-50 text-blue-600 border border-blue-100',
    critical: 'bg-red-50 text-red-600 border border-red-100',
    warning: 'bg-amber-50 text-amber-600 border border-amber-100',
    healthy: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    ai: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  };

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-[10px] p-5 shadow-card hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between font-sans">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
          {title}
        </span>
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconContainerStyles[variant])}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-[28px] font-bold text-slate-900 font-sans tracking-tight leading-none">
          {value}
        </span>
        {change && (
          <span
            className={clsx(
              'text-[11px] font-semibold px-2 py-0.5 rounded-full font-mono shrink-0',
              isNegativeTrend
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            )}
          >
            {isNegativeTrend ? '▼' : '▲'} {change}
          </span>
        )}
      </div>
    </div>
  );
};
