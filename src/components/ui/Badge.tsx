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
    critical: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    ai: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColors = {
    critical: 'bg-red-600',
    warning: 'bg-amber-600',
    healthy: 'bg-emerald-600',
    info: 'bg-blue-600',
    ai: 'bg-indigo-600',
    neutral: 'bg-slate-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-[12px] px-2.5 py-1 gap-2 font-medium',
    lg: 'text-[13px] px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border tracking-tight font-sans transition-all shrink-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={clsx('w-2 h-2 rounded-full shrink-0', dotColors[variant])} />}
      <span>{children}</span>
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

export const StatusBadge: React.FC<{
  status?: IncidentStatus | string;
  variant?: 'critical' | 'warning' | 'healthy' | 'info' | 'ai' | 'neutral' | string;
  text?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, variant: customVariant, text, children, size = 'md' }) => {
  const displayLabel = children || text || (typeof status === 'string' ? status : String(status || ''));
  const normalized = String(status || customVariant || '').toUpperCase();
  const map: Record<string, 'critical' | 'warning' | 'healthy' | 'info' | 'ai' | 'neutral'> = {
    OPEN: 'critical',
    INVESTIGATING: 'ai',
    AWAITING_APPROVAL: 'warning',
    REMEDIATING: 'ai',
    VERIFYING: 'info',
    RESOLVED: 'healthy',
    FAILED: 'critical',
    ESCALATED: 'warning',
    EXECUTING: 'ai',
    COMPLETED: 'healthy',
    CRITICAL: 'critical',
    DEGRADED: 'warning',
    HEALTHY: 'healthy',
    SUCCESS: 'healthy',
    SUCCESSFUL: 'healthy',
    WARNING: 'warning',
    DANGER: 'critical',
    INFO: 'info',
  };
  const variant = (customVariant as any) || map[normalized] || 'neutral';
  return <Badge variant={variant as any} size={size}>{displayLabel}</Badge>;
};

