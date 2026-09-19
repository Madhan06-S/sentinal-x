import React from 'react';
import { cn } from '../../lib/utils';

export const timeRanges = ['Live 1h', '6h', '24h', '7d'];

interface TimeToggleProps {
  active: string;
  onChange: (val: string) => void;
}

export function TimeToggle({ active, onChange }: TimeToggleProps) {
  return (
    <div className="flex bg-zinc-900/90 border border-zinc-800 p-1 rounded-lg backdrop-blur-md">
      {timeRanges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={cn(
            'px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer',
            active === range
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          )}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
