import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Sparkles, Bot, Search, AlertCircle, ShieldAlert, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ReasoningEntry {
  id: string;
  timestamp: string;
  agentName: string;
  agentType: 'investigation' | 'telemetry' | 'decision' | 'skeptic' | 'remediation';
  state: 'THINKING' | 'EVIDENCE' | 'HYPOTHESIS' | 'COMPLETE';
  confidence?: number;
  text: string;
  counterEvidence?: string;
  revisedConfidence?: number;
}

// Typewriter component for reasoning text (40ms/char)
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 35 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

interface AIReasoningStreamProps {
  entries?: ReasoningEntry[];
}

export const initialReasoningEntries: ReasoningEntry[] = [
  {
    id: 'entry-1',
    timestamp: '12:41:03',
    agentName: 'TELEMETRY AGENT',
    agentType: 'telemetry',
    state: 'EVIDENCE',
    text: 'Ingested 47 telemetry alerts across us-east-1 payment cluster. Correlating 7.4x error spike.',
  },
  {
    id: 'entry-2',
    timestamp: '12:41:15',
    agentName: 'INVESTIGATION AGENT',
    agentType: 'investigation',
    state: 'HYPOTHESIS',
    confidence: 84,
    text: 'Formulated primary hypothesis: PostgreSQL connection pool exhaustion induced by memory leak.',
  },
  {
    id: 'entry-3',
    timestamp: '12:41:25',
    agentName: 'SKEPTIC AGENT',
    agentType: 'skeptic',
    state: 'EVIDENCE',
    text: 'Counter-probe: Checked network partition hypothesis. Latency spike is downstream, not packet loss.',
    counterEvidence: 'Network sockets normal. Proving memory leak in payment-service v2.4.1.',
    revisedConfidence: 94,
  },
  {
    id: 'entry-4',
    timestamp: '12:41:41',
    agentName: 'DECISION AGENT',
    agentType: 'decision',
    state: 'HYPOTHESIS',
    confidence: 94,
    text: 'Determined recommended action: ROLLBACK_DEPLOYMENT to v2.4.0. Mandating L3 human approval.',
  },
];

export const AIReasoningStream: React.FC<AIReasoningStreamProps> = ({
  entries = initialReasoningEntries,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const agentStyles = {
    telemetry: { chip: 'bg-cyan-950/80 text-cyan-400 border-cyan-800', icon: Search },
    investigation: { chip: 'bg-indigo-950/80 text-indigo-400 border-indigo-800', icon: Bot },
    decision: { chip: 'bg-amber-950/80 text-amber-400 border-amber-800', icon: Cpu },
    skeptic: { chip: 'bg-purple-950/80 text-purple-300 border-purple-800 shadow-[0_0_12px_rgba(168,85,247,0.3)]', icon: ShieldAlert },
    remediation: { chip: 'bg-emerald-950/80 text-emerald-400 border-emerald-800', icon: CheckCircle2 },
  };

  const stateBadges = {
    THINKING: 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse',
    EVIDENCE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    HYPOTHESIS: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    COMPLETE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-base font-bold text-zinc-100 font-sans">
            AI Agent Reasoning Stream
          </span>
        </div>
      }
      subtitle="Multi-agent investigation, skeptic counter-evidence & confidence revisions"
    >
      <div
        ref={scrollRef}
        className="space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto pr-1"
      >
        <AnimatePresence mode="popLayout">
          {entries.map((item) => {
            const AgentIcon = agentStyles[item.agentType]?.icon || Bot;
            const isSkeptic = item.agentType === 'skeptic';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'p-3.5 rounded-xl border transition-all duration-200 space-y-2',
                  isSkeptic
                    ? 'bg-purple-950/20 border-purple-800/60 shadow-[0_0_16px_rgba(168,85,247,0.1)]'
                    : 'bg-zinc-950/70 border-zinc-800/90'
                )}
              >
                {/* Header line: Agent chip + timestamp + state badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1.5',
                        agentStyles[item.agentType]?.chip
                      )}
                    >
                      <AgentIcon className="w-3 h-3" />
                      {item.agentName}
                    </span>
                    <span className="text-[10px] text-zinc-500">{item.timestamp}</span>
                  </div>

                  {/* State badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider uppercase',
                        stateBadges[item.state]
                      )}
                    >
                      {item.state === 'THINKING' && (
                        <Loader2 className="w-2.5 h-2.5 animate-spin inline mr-1" />
                      )}
                      {item.state}
                    </span>
                  </div>
                </div>

                {/* Reasoning Typewriter Text */}
                <p className="text-zinc-200 font-mono text-[11px] leading-relaxed">
                  <TypewriterText text={item.text} />
                </p>

                {/* Hypothesis progress bar if present */}
                {item.confidence !== undefined && (
                  <div className="p-2 bg-zinc-900/90 rounded-lg border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-400">Hypothesis Confidence</span>
                      <span className="font-bold text-cyan-300">{item.confidence}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Skeptic Counter-Evidence Block */}
                {item.counterEvidence && (
                  <div className="p-2.5 bg-purple-950/40 border border-purple-800/80 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Skeptic Counter-Probe Verified
                    </span>
                    <p className="text-[11px] text-purple-200 font-sans leading-relaxed">
                      {item.counterEvidence}
                    </p>
                    {item.revisedConfidence && (
                      <div className="flex justify-between items-center text-[10px] pt-1 text-purple-300 font-bold border-t border-purple-800/60">
                        <span>Revised Confidence:</span>
                        <span className="text-emerald-400 font-extrabold">{item.revisedConfidence}% (+10%)</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
};
