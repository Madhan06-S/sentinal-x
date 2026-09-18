import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, Play, CheckCircle2, FileText, User, ArrowDownRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface VerdictData {
  incidentId: string;
  title: string;
  rootCause: string;
  evidenceCount: number;
  actionTaken: string;
  verificationResult: string;
  approverInitials: string;
  approverName: string;
  resolvedTime: string;
}

export const sampleVerdicts: VerdictData[] = [
  {
    incidentId: 'INC-1042',
    title: 'Payment Service Degraded & Database Connection Exhaustion',
    rootCause: 'Database connection pool leakage introduced in deployment v2.4.1',
    evidenceCount: 4,
    actionTaken: 'ROLLBACK_DEPLOYMENT (v2.4.0)',
    verificationResult: 'errors ↓98%',
    approverInitials: 'SJ',
    approverName: 'Sarah Jenkins (Lead SRE)',
    resolvedTime: '12:42:25',
  },
  {
    incidentId: 'INC-1041',
    title: 'Auth Token Verification Latency Spike',
    rootCause: 'Redis eviction policy misconfiguration causing cache miss storm',
    evidenceCount: 3,
    actionTaken: 'FLUSH_REDIS_KEYS_AND_RECONFIG',
    verificationResult: 'latency ↓92%',
    approverInitials: 'MC',
    approverName: 'Marcus Chen (Security SRE)',
    resolvedTime: '09:15:30',
  },
];

interface VerdictCardProps {
  verdicts?: VerdictData[];
  onReplayIncident?: (incidentId: string) => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdicts = sampleVerdicts,
  onReplayIncident,
}) => {
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const handleReplayClick = (id: string) => {
    setReplayingId(id);
    if (onReplayIncident) onReplayIncident(id);
    setTimeout(() => setReplayingId(null), 3000);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h3 className="text-base font-bold text-zinc-100 font-sans flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Case-File Verdict Reports
        </h3>
        <span className="text-xs text-zinc-400">Resolved Incidents Audit Trail</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {verdicts.map((v) => (
          <Card key={v.incidentId} className="border-emerald-500/40 bg-emerald-950/10 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400">{v.incidentId}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> VERIFIED RESOLVED
                  </span>
                </div>
                <h4 className="text-sm font-semibold font-sans text-zinc-100 mt-1">{v.title}</h4>
              </div>

              {/* Replay Button */}
              <button
                onClick={() => handleReplayClick(v.incidentId)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(99,102,241,0.3)] cursor-pointer shrink-0"
              >
                {replayingId === v.incidentId ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                {replayingId === v.incidentId ? 'Replaying...' : 'REPLAY'}
              </button>
            </div>

            {/* Case Details */}
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-2">
              <div>
                <span className="text-zinc-500 text-[10px] block uppercase">Confirmed Root Cause</span>
                <span className="text-zinc-200 leading-snug block font-sans text-xs mt-0.5">{v.rootCause}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Evidence Verified:</span>
                  <span className="text-cyan-300 font-bold">{v.evidenceCount} Signals</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Action Executed:</span>
                  <span className="text-indigo-300 font-bold">{v.actionTaken}</span>
                </div>
              </div>
            </div>

            {/* Approver Avatar & Recovery Stat */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-[10px] text-white">
                  {v.approverInitials}
                </div>
                <span className="text-zinc-400 text-[11px]">{v.approverName}</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold text-xs flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" /> {v.verificationResult}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
