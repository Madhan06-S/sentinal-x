import React from 'react';
import { clsx } from 'clsx';
import { AlertSeverity } from '../../types/alert';
import { IncidentStatus } from '../../types/incident';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'warning' | 'healthy' | 'info' | 'ai' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  dot = true,
}) => {
  const variantStyles = {
    critical: 'bg-red-950/60 text-red-400 border-red-800/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    healthy: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    info: 'bg-blue-950/60 text-blue-400 border-blue-800/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    ai: 'bg-purple-950/60 text-purple-300 border-purple-800/60 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const dotColors = {
    critical: 'bg-red-500 animate-pulse',
    warning: 'bg-amber-500',
    healthy: 'bg-emerald-400',
    info: 'bg-blue-400',
    ai: 'bg-purple-400 animate-pulse',
    neutral: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border tracking-wide uppercase font-mono transition-all',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity; size?: 'sm' | 'md' | 'lg' }> = ({
  severity,
  size = 'md',
}) => {
  const map: Record<AlertSeverity, 'critical' | 'warning' | 'info' | 'neutral'> = {
    CRITICAL: 'critical',
    HIGH: 'warning',
    MEDIUM: 'info',
    LOW: 'neutral',
  };
  return <Badge variant={map[severity]} size={size}>{severity}</Badge>;
};

export const StatusBadge: React.FC<{ status: IncidentStatus; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  size = 'md',
}) => {
  const map: Record<IncidentStatus, 'critical' | 'warning' | 'healthy' | 'info' | 'ai' | 'neutral'> = {
    OPEN: 'critical',
    INVESTIGATING: 'ai',
    AWAITING_APPROVAL: 'warning',
    REMEDIATING: 'ai',
    VERIFYING: 'info',
    RESOLVED: 'healthy',
    FAILED: 'critical',
  };
  return <Badge variant={map[status]} size={size}>{status.replace('_', ' ')}</Badge>;
};
