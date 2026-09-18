import React from 'react';
import { Card } from '../ui/Card';
import { Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { AIActivityItem } from '../../types/api';

interface AIActivityStreamProps {
  activities?: AIActivityItem[];
}

export const AIActivityStream: React.FC<AIActivityStreamProps> = ({ activities = [] }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-base font-bold text-slate-100">Live AI Reasoning & Operations</span>
        </div>
      }
      subtitle="Autonomous agent correlation, investigation & remediation log"
    >
      <div className="space-y-3 font-mono text-xs">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl"
          >
            <span className="text-slate-400 shrink-0 text-[11px] pt-0.5">{act.timestamp}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-medium">{act.action}</span>
                {act.incident_id && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {act.incident_id}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {act.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {act.status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
              {act.status === 'FAILED' && <AlertCircle className="w-4 h-4 text-red-400" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
