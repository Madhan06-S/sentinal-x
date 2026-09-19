import React from 'react';
import { Card } from '../ui/Card';
import { Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { AIActivityItem } from '../../types/api';

interface AIActivityStreamProps {
  activities?: AIActivityItem[];
}

const DEFAULT_ACTIVITIES: AIActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '12:44:02',
    action: 'Correlated 47 alerts from payment-service, postgres-primary into incident INC-1042',
    status: 'COMPLETED',
    incident_id: 'INC-1042',
  },
  {
    id: 'act-2',
    timestamp: '12:44:05',
    action: 'FORMULATE HYPOTHESIS: Deployment v2.4.1 caused database connection pool exhaustion (HikariCP 100/100 active)',
    status: 'COMPLETED',
    incident_id: 'INC-1042',
  },
  {
    id: 'act-3',
    timestamp: '12:44:12',
    action: 'DECISION ENGINE: Action ROLLBACK_DEPLOYMENT selected with 94% confidence. Risk policy = HIGH. SRE approval requested.',
    status: 'IN_PROGRESS',
    incident_id: 'INC-1042',
  },
  {
    id: 'act-4',
    timestamp: '12:44:30',
    action: 'REMEDIATION VERIFIER: Flushed HikariCP connection pool and verified 0 active socket leaks',
    status: 'COMPLETED',
    incident_id: 'INC-1042',
  },
];

export const AIActivityStream: React.FC<AIActivityStreamProps> = ({ activities = DEFAULT_ACTIVITIES }) => {
  const items = activities.length > 0 ? activities : DEFAULT_ACTIVITIES;

  const getAgentInitial = (actionStr: string) => {
    if (actionStr.includes('Correlated')) return { initial: 'I', name: 'Investigation Agent', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (actionStr.includes('HYPOTHESIS')) return { initial: 'S', name: 'Skeptic Agent', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (actionStr.includes('DECISION')) return { initial: 'D', name: 'Decision Engine', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { initial: 'R', name: 'Remediation Agent', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="text-[15px] font-bold text-slate-900 font-sans">Live AI Multi-Agent Reasoning Stream</span>
        </div>
      }
      subtitle="Autonomous agent correlation, investigation & decision trail"
    >
      <div className="space-y-3 font-sans">
        {items.map((act) => {
          const agent = getAgentInitial(act.action);

          return (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3.5 bg-white border border-[#E5E9F0] rounded-[10px] shadow-card hover:shadow-card-hover transition-all"
            >
              {/* Agent Avatar Circle */}
              <div className={`w-8 h-8 rounded-full border ${agent.bg} flex items-center justify-center font-bold text-[12px] shrink-0 font-mono shadow-2xs`}>
                {agent.initial}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-900">{agent.name}</span>
                    {act.incident_id && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {act.incident_id}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{act.timestamp}</span>
                </div>

                <p className="text-[13px] text-slate-700 leading-relaxed font-sans font-normal">
                  {act.action}
                </p>

                {/* Thin 3px Confidence Track */}
                <div className="w-full bg-[#F1F4F9] h-1 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-600 h-full rounded-full w-[94%]" />
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {act.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {act.status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                {act.status === 'FAILED' && <AlertCircle className="w-4 h-4 text-red-600" />}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
