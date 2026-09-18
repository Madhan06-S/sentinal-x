import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Lock, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AutonomyLevel = 1 | 2 | 3 | 4;

interface AutonomyDialProps {
  currentLevel?: AutonomyLevel;
  onChangeLevel?: (level: AutonomyLevel) => void;
}

export const AutonomyDial: React.FC<AutonomyDialProps> = ({
  currentLevel = 3,
  onChangeLevel,
}) => {
  const [level, setLevel] = useState<AutonomyLevel>(currentLevel);

  const levels: Record<AutonomyLevel, { label: string; subtext: string; color: string }> = {
    1: { label: 'L1: MANUAL ONLY', subtext: 'Human executes all steps', color: '#94A3B8' },
    2: { label: 'L2: AI ASSIST', subtext: 'AI provides evidence only', color: '#3B82F6' },
    3: { label: 'L3: SEMI-AUTONOMOUS', subtext: 'Requires engineer approval', color: '#F59E0B' },
    4: { label: 'L4: FULL AUTONOMY', subtext: 'Autonomous auto-execution', color: '#10B981' },
  };

  const handleSelect = (l: AutonomyLevel) => {
    setLevel(l);
    if (onChangeLevel) onChangeLevel(l);
  };

  // Angles for 4 notches on top arc (180deg total)
  const angles: Record<AutonomyLevel, number> = {
    1: -45,
    2: -15,
    3: 15,
    4: 45,
  };

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-md font-mono select-none">
      {/* Interactive Dial graphic */}
      <div className="relative w-9 h-9 flex items-center justify-center cursor-pointer group">
        <svg className="w-full h-full" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#1E293B" strokeWidth="3" />
          {/* Active Level Arc */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={levels[level].color}
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={100 - (level / 4) * 75}
            className="transition-all duration-300"
          />
        </svg>

        {/* Dial Needle */}
        <motion.div
          animate={{ rotate: angles[level] }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-0.5 h-3.5 origin-bottom rounded-full"
            style={{ backgroundColor: levels[level].color }}
          />
        </motion.div>

        <span className="absolute text-[9px] font-bold text-white">{level}</span>
      </div>

      {/* Level Labels & Notch Selectors */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold font-mono tracking-tight" style={{ color: levels[level].color }}>
            {levels[level].label}
          </span>
          {level === 4 && (
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold animate-pulse">
              ACTIVE
            </span>
          )}
        </div>

        {/* 4 Notch Click Buttons */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {([1, 2, 3, 4] as AutonomyLevel[]).map((l) => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              className={cn(
                'w-4 h-1.5 rounded-full transition-all cursor-pointer',
                level >= l ? 'opacity-100' : 'opacity-30 bg-zinc-700'
              )}
              style={{ backgroundColor: level >= l ? levels[l].color : undefined }}
              title={`Switch to Level ${l}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
