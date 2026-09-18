import React from 'react';
import { SpotlightCard } from './SpotlightCard';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  onClick,
}) => {
  return (
    <SpotlightCard className={cn('p-5', className)} onClick={onClick}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-zinc-100 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5 font-sans">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </SpotlightCard>
  );
};
