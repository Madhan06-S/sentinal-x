import React from 'react';
import { Card } from '../ui/Card';
import { TimelineEvent } from '../../types/incident';
import { GitCommit, Activity, AlertTriangle, Sparkles, UserCheck, Wrench, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface IncidentTimelineProps {
  events?: TimelineEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events = [] }) => {
  const icons = {
    DEPLOYMENT: <GitCommit className="w-4 h-4 text-cyan-400" />,
    METRIC_SPIKE: <Activity className="w-4 h-4 text-amber-400" />,
    ALERT: <AlertTriangle className="w-4 h-4 text-red-400" />,
    AI_EVENT: <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />,
    HUMAN_ACTION: <UserCheck className="w-4 h-4 text-indigo-400" />,
    REMEDIATION: <Wrench className="w-4 h-4 text-indigo-400" />,
    VERIFICATION: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  };

  const borderColors = {
    DEPLOYMENT: 'border-cyan-500/40 bg-cyan-950/20',
    METRIC_SPIKE: 'border-amber-500/40 bg-amber-950/20',
    ALERT: 'border-red-500/40 bg-red-950/20',
    AI_EVENT: 'border-purple-500/40 bg-purple-950/20',
    HUMAN_ACTION: 'border-indigo-500/40 bg-indigo-950/20',
    REMEDIATION: 'border-indigo-500/40 bg-indigo-950/20',
    VERIFICATION: 'border-emerald-500/40 bg-emerald-950/20',
  };

  return (
    <Card title="Incident Chronological Timeline" subtitle="Correlated telemetry events leading to resolution">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-4 group">
            {/* Timeline node icon */}
            <div
              className={clsx(
                'absolute -left-6 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10',
                borderColors[evt.type]
              )}
            >
              {icons[evt.type]}
            </div>

            {/* Event content box */}
            <div className="flex-1 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl group-hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-100">{evt.title}</h4>
                <span className="font-mono text-xs text-slate-400 shrink-0">{evt.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
