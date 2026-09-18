import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isNegativeTrend?: boolean;
  icon: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'healthy' | 'ai';
}

// CountUp number component
const CountUpValue: React.FC<{ value: string | number }> = ({ value }) => {
  const num = typeof value === 'number' ? value : parseInt(value);
  const isNumeric = !isNaN(num);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isNumeric) return;
    let start = 0;
    const duration = 800;
    const step = Math.max(1, Math.floor(num / 20));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setCurrent(num);
        clearInterval(timer);
      } else {
        setCurrent(start);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [num, isNumeric]);

  if (!isNumeric) return <span>{value}</span>;
  return <span>{current}</span>;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isNegativeTrend = false,
  icon,
  variant = 'default',
}) => {
  const borderColors = {
    default: 'hover:border-cyan-500/50 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]',
    critical: 'border-red-900/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-500/60',
    warning: 'border-amber-900/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/60',
    healthy: 'border-emerald-900/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/60',
    ai: 'border-purple-900/50 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/60',
  };

  const iconColors = {
    default: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40',
    critical: 'text-red-400 bg-red-950/60 border-red-800/40',
    warning: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
    healthy: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
    ai: 'text-purple-300 bg-purple-950/60 border-purple-800/40',
  };

  return (
    <Card className={cn('transition-all duration-300 card-glow-hover cursor-pointer', borderColors[variant])}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', iconColors[variant])}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
          <CountUpValue value={value} />
        </span>
        {change && (
          <span
            className={cn(
              'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5',
              isNegativeTrend ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
            )}
          >
            {isNegativeTrend ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
    </Card>
  );
};
