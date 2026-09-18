import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { RemediationStatus } from '../../types/incident';
import { Wrench, CheckCircle2, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface RemediationPanelProps {
  remediation?: RemediationStatus;
}

export const RemediationPanel: React.FC<RemediationPanelProps> = ({ remediation }) => {
  if (!remediation) return null;

  const isCompleted = remediation.status === 'COMPLETED';

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-bold text-slate-100">Autonomous Remediation Execution</span>
          </div>
          <Badge
            variant={
              isCompleted
                ? 'healthy'
                : remediation.status === 'EXECUTING' || remediation.status === 'VERIFYING'
                ? 'ai'
                : 'neutral'
            }
            size="md"
          >
            {remediation.status}
          </Badge>
        </div>
      }
      subtitle="Execution progress & real-time recovery verification pipeline"
      className={isCompleted ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-indigo-500/30'}
    >
      <div className="space-y-6">
        {/* Top Info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs">
          <div>
            <span className="text-slate-400 block">Action Target</span>
            <span className="text-slate-200 font-bold">{remediation.target_service}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Execution Action</span>
            <span className="text-indigo-300 font-bold">{remediation.action}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Started At</span>
            <span className="text-slate-300">
              {remediation.started_at ? new Date(remediation.started_at).toLocaleTimeString() : '12:42:21'}
            </span>
          </div>
        </div>

        {/* Live Animated Progress Bar */}
        <ProgressBar
          progress={remediation.progress_percent}
          color={isCompleted ? 'emerald' : 'indigo'}
          animated={!isCompleted}
        />

        {/* Verification Pipeline Checklist */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block">
            Verification Pipeline Steps
          </span>
          <div className="space-y-2 font-mono text-xs">
            {remediation.verification_steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {step.status === 'PASSED' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {step.status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />}
                  {step.status === 'PENDING' && <Clock className="w-4 h-4 text-slate-500 shrink-0" />}
                  {step.status === 'FAILED' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className="text-slate-200">{step.name}</span>
                </div>
                <span
                  className={
                    step.status === 'PASSED'
                      ? 'text-emerald-400 font-bold'
                      : step.status === 'IN_PROGRESS'
                      ? 'text-purple-400 font-bold'
                      : 'text-slate-500'
                  }
                >
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isCompleted && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">✓ Remediation execution completed & verified successfully</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Error rate normalized. Database connection pool healthy. Incident resolved.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
