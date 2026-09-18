import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { History, Play, Pause, RotateCcw, AlertTriangle, Sparkles, CheckCircle2, Cpu, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ScrubberTick {
  id: string;
  time: string;
  label: string;
  type: 'alert' | 'correlation' | 'hypothesis' | 'approval' | 'remediation' | 'recovery';
  incidentStatus: string;
  reasoningIndex: number;
}

export const scrubberTicks: ScrubberTick[] = [
  { id: 't1', time: '12:41:03', label: 'Alert Storm', type: 'alert', incidentStatus: 'OPEN', reasoningIndex: 0 },
  { id: 't2', time: '12:41:15', label: 'Correlation', type: 'correlation', incidentStatus: 'INVESTIGATING', reasoningIndex: 1 },
  { id: 't3', time: '12:41:27', label: 'Hypothesis', type: 'hypothesis', incidentStatus: 'INVESTIGATING', reasoningIndex: 2 },
  { id: 't4', time: '12:41:41', label: 'Approval', type: 'approval', incidentStatus: 'AWAITING_APPROVAL', reasoningIndex: 3 },
  { id: 't5', time: '12:42:03', label: 'Remediation', type: 'remediation', incidentStatus: 'REMEDIATING', reasoningIndex: 3 },
  { id: 't6', time: '12:42:25', label: 'Recovery', type: 'recovery', incidentStatus: 'RESOLVED', reasoningIndex: 3 },
];

interface TimeTravelScrubberProps {
  currentIndex?: number; // 0 to 5
  onScrub?: (index: number) => void;
  onReplay?: () => void;
}

export const TimeTravelScrubber: React.FC<TimeTravelScrubberProps> = ({
  currentIndex = 3,
  onScrub,
  onReplay,
}) => {
  const [activeIdx, setActiveIdx] = useState(currentIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleScrub = (idx: number) => {
    setActiveIdx(idx);
    if (onScrub) onScrub(idx);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let step = 0;
    handleScrub(0);
    const interval = setInterval(() => {
      step += 1;
      if (step < scrubberTicks.length) {
        handleScrub(step);
      } else {
        setIsPlaying(false);
        clearInterval(interval);
      }
    }, 1500);
  };

  const tickIcons = {
    alert: <AlertTriangle className="w-3 h-3 text-red-400" />,
    correlation: <Sparkles className="w-3 h-3 text-cyan-400" />,
    hypothesis: <Cpu className="w-3 h-3 text-purple-400" />,
    approval: <History className="w-3 h-3 text-amber-400" />,
    remediation: <Wrench className="w-3 h-3 text-indigo-400" />,
    recovery: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span className="text-base font-bold text-zinc-100 font-sans">
              Time-Travel Event Scrubber
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayToggle}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(99,102,241,0.3)] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isPlaying ? 'Pause Replay' : 'Replay Timeline'}
            </button>
          </div>
        </div>
      }
      subtitle="Drag the timeline scrubber to view past node states, reasoning snapshots, and status updates"
    >
      <div className="space-y-6 p-2 font-mono select-none">
        {/* Scrubber Track */}
        <div className="relative pt-6 pb-2">
          {/* Base Track Line */}
          <div className="w-full h-2 bg-zinc-900 rounded-full border border-zinc-800 relative">
            {/* Active Progress Line */}
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              style={{ width: `${(activeIdx / (scrubberTicks.length - 1)) * 100}%` }}
            />
          </div>

          {/* Tick Marks & Handles */}
          <div className="absolute top-4 left-0 right-0 flex justify-between px-1 pointer-events-none">
            {scrubberTicks.map((tick, idx) => (
              <div
                key={tick.id}
                onClick={() => handleScrub(idx)}
                className="pointer-events-auto flex flex-col items-center cursor-pointer group"
              >
                {/* Tick dot */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10',
                    activeIdx === idx
                      ? 'border-cyan-400 bg-zinc-950 scale-125 shadow-[0_0_16px_rgba(34,211,238,0.8)] ring-2 ring-cyan-400/40'
                      : idx <= activeIdx
                      ? 'border-indigo-500 bg-zinc-900'
                      : 'border-zinc-700 bg-zinc-950'
                  )}
                >
                  {tickIcons[tick.type]}
                </div>

                {/* Tick Label */}
                <div className="mt-3 text-center">
                  <span
                    className={cn(
                      'text-[10px] font-bold block transition-colors',
                      activeIdx === idx ? 'text-cyan-300 font-extrabold' : 'text-zinc-400'
                    )}
                  >
                    {tick.label}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">{tick.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current State Info Banner */}
        <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Scrubber State:</span>
            <span className="font-bold text-cyan-300">{scrubberTicks[activeIdx].label}</span>
            <span className="text-zinc-500">({scrubberTicks[activeIdx].time})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Incident Status:</span>
            <span className="font-bold text-amber-400 uppercase">
              {scrubberTicks[activeIdx].incidentStatus}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
