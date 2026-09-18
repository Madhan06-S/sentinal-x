import React from 'react';
import { IncidentTimelineStep } from '../../types/incident';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';

interface TimelineViewProps {
  timeline: IncidentTimelineStep[];
  isSimulating: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Sequential Progression (T+0s → T+8s)</span>
        <span>Deterministic Demo Order</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {timeline.map((step) => {
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <div
              key={step.id}
              className={`relative p-3.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 shadow-sm'
                  : isActive
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              {/* Header: Code & Time */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : isActive
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step.code}
                </span>

                <span className="text-[10px] font-mono">
                  {step.timestamp || `T+${step.delaySec}s`}
                </span>
              </div>

              {/* Step Title & Status Icon */}
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <PlayCircle className="w-4 h-4 text-amber-600 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-xs font-semibold leading-snug ${
                      isDone || isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
