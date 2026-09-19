import React from 'react';
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
  hoverEffect = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-[#E5E9F0] rounded-[10px] shadow-card p-5 transition-all duration-150',
        hoverEffect && 'hover:shadow-card-hover hover:border-[#D5DBE5]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E9F0]">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight font-sans">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-[12px] text-slate-500 mt-0.5 font-sans">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
