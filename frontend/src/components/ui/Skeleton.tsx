import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'bg-slate-800/60 animate-pulse rounded-lg border border-slate-700/30',
        className
      )}
    />
  );
};
