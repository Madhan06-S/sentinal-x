import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'indigo' | 'emerald' | 'amber' | 'red';
  animated?: boolean;
  className?: string;
  showPercent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'indigo',
  animated = true,
  className,
  showPercent = true,
}) => {
  const colors = {
    indigo: 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    red: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]',
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between items-center mb-1 text-xs font-mono text-slate-400">
        <span>Remediation Execution Progress</span>
        {showPercent && <span className="font-semibold text-slate-200">{Math.round(progress)}%</span>}
      </div>
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color],
            animated && 'relative overflow-hidden'
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan-line" />
          )}
        </div>
      </div>
    </div>
  );
};
