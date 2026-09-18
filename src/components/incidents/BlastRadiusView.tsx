import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Target, AlertTriangle, Layers, DollarSign, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BlastRadiusViewProps {
  rootCauseService?: string;
  ring1Count?: number; // Direct Dependencies
  ring2Count?: number; // Degraded
  ring3Count?: number; // Business Impact Services
}

// CountUp component
const CountUp: React.FC<{ end: number; duration?: number }> = ({ end, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / (end || 1)));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, Math.max(stepTime, 20));

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
};

export const BlastRadiusView: React.FC<BlastRadiusViewProps> = ({
  rootCauseService = 'payment-service',
  ring1Count = 4,
  ring2Count = 2,
  ring3Count = 3,
}) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-base font-bold text-zinc-100 font-sans">
            Incident Blast Radius Analysis
          </span>
        </div>
      }
      subtitle="Concentric blast radius propagation outward from root cause service"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
        {/* SVG Concentric Rings */}
        <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
            {/* Outer Ring 3: Business Impact */}
            <motion.circle
              cx="120"
              cy="120"
              r="105"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="6 6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Middle Ring 2: Degraded Services */}
            <motion.circle
              cx="120"
              cy="120"
              r="75"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            />
            {/* Inner Ring 1: Direct Dependencies */}
            <motion.circle
              cx="120"
              cy="120"
              r="45"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
            />
          </svg>

          {/* Center Root Cause Node */}
          <div className="absolute flex flex-col items-center justify-center text-center p-2 rounded-full bg-red-950/80 border-2 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.6)] animate-pulse w-24 h-24 z-10">
            <Server className="w-5 h-5 text-red-400 mb-0.5" />
            <span className="font-mono text-[10px] font-bold text-red-200 leading-tight truncate max-w-[80px]">
              {rootCauseService}
            </span>
            <span className="text-[8px] font-mono uppercase font-semibold text-red-400">ROOT CAUSE</span>
          </div>
        </div>

        {/* Ring Counters & Info Cards */}
        <div className="flex-1 space-y-3 w-full font-mono text-xs">
          {/* Ring 1 Card */}
          <div className="p-3 bg-zinc-950/80 border border-cyan-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div>
                <span className="font-bold text-cyan-300 block">RING 1: DIRECT DEPENDENCIES</span>
                <span className="text-[10px] text-zinc-400 font-sans">
                  Immediate downstream API & database callers
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-cyan-300">
                <CountUp end={ring1Count} />
              </span>
              <span className="text-[10px] text-zinc-500 block">Services</span>
            </div>
          </div>

          {/* Ring 2 Card */}
          <div className="p-3 bg-zinc-950/80 border border-amber-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <div>
                <span className="font-bold text-amber-300 block">RING 2: DEGRADED SERVICES</span>
                <span className="text-[10px] text-zinc-400 font-sans">
                  Latency propagation & thread pool pressure
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-300">
                <CountUp end={ring2Count} />
              </span>
              <span className="text-[10px] text-zinc-500 block">Services</span>
            </div>
          </div>

          {/* Ring 3 Card */}
          <div className="p-3 bg-zinc-950/80 border border-red-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
              <div>
                <span className="font-bold text-red-300 block">RING 3: BUSINESS IMPACT</span>
                <span className="text-[10px] text-zinc-400 font-sans">
                  Customer transaction & checkout capability failures
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-red-400">
                <CountUp end={ring3Count} />
              </span>
              <span className="text-[10px] text-zinc-500 block">Capabilities</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
