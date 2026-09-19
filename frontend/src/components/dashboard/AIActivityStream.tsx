import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { CheckCircle2, Loader2, AlertCircle, Bot, Inbox } from 'lucide-react';
import { AIActivityItem } from '../../types/api';
import { realtimeService } from '../../services/realtime';

export type AgentRoleFilter = 'ALL' | 'INVESTIGATION' | 'SKEPTIC' | 'DECISION' | 'REMEDIATION';

interface AIActivityStreamProps {
  activities?: AIActivityItem[];
  agentFilter?: AgentRoleFilter;
}

const DEFAULT_ACTIVITIES: AIActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '12:44:02',
    action: 'Correlated 47 alerts from payment-service, postgres-primary into incident INC-1042',
    status: 'COMPLETED',
    incident_id: 'INC-1042',
    agent_name: 'Investigator Agent',
  },
  {
    id: 'act-2',
    timestamp: '12:44:05',
    action: 'Deployment v2.4.1 caused database connection pool exhaustion (HikariCP 100/100 active)',
    status: 'COMPLETED',
    incident_id: 'INC-1042',
    agent_name: 'Skeptic Agent',
  },
  {
    id: 'act-3',
    timestamp: '12:44:12',
    action: 'Action ROLLBACK_DEPLOYMENT selected with 94% confidence. Autonomy gate evaluated.',
    status: 'IN_PROGRESS',
    incident_id: 'INC-1042',
    agent_name: 'Decision Engine',
  },
  {
    id: 'act-4',
    timestamp: '12:44:30',
    action: 'Flushed HikariCP connection pool and verified 0 active socket leaks',
    status: 'COMPLETED',
    incident_id: 'INC-1042',
    agent_name: 'Remediation Agent',
  },
];

export const AIActivityStream: React.FC<AIActivityStreamProps> = ({
  activities,
  agentFilter = 'ALL',
}) => {
  const [liveStream, setLiveStream] = useState<AIActivityItem[]>(activities || DEFAULT_ACTIVITIES);

  useEffect(() => {
    if (activities && activities.length > 0) {
      setLiveStream(activities);
    }
  }, [activities]);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((event) => {
      if (event.type === 'AGENT_STREAM_EVENT' || event.type === 'AI_STEP') {
        const newItem: AIActivityItem = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString(),
          action: event.payload.action || event.payload.message || 'Agent executed task',
          status: event.payload.status || 'COMPLETED',
          incident_id: event.payload.incident_id || 'INC-1042',
          agent_name: event.payload.agent_name,
        };
        setLiveStream((prev) => [newItem, ...prev]);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const getAgentInfo = (item: AIActivityItem) => {
    const name = item.agent_name || '';
    const act = item.action || '';

    if (name.includes('Investig') || act.includes('Correlated') || act.includes('Investigat')) {
      return { initial: 'I', name: 'Investigator Agent', role: 'INVESTIGATION', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (name.includes('Skeptic') || act.includes('Deployment') || act.includes('caused') || act.includes('Skeptic')) {
      return { initial: 'S', name: 'Skeptic Agent', role: 'SKEPTIC', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (name.includes('Decision') || act.includes('Action') || act.includes('selected') || act.includes('Autonomy')) {
      return { initial: 'D', name: 'Decision Engine', role: 'DECISION', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    return { initial: 'R', name: 'Remediation Agent', role: 'REMEDIATION', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const filteredItems = liveStream.filter((item) => {
    if (agentFilter === 'ALL') return true;
    const info = getAgentInfo(item);
    return info.role === agentFilter;
  });

  return (
    <Card
      title={
        <div className="flex items-center gap-2 font-sans">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="text-[14px] font-bold text-slate-900">Autonomous Agent Stream</span>
        </div>
      }
      subtitle="Real-time multi-agent reasoning & execution log"
    >
      <div className="space-y-2.5 font-sans">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-50 border border-dashed border-[#E5E9F0] rounded-xl text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400" />
            <p className="text-[13px] font-medium text-slate-700">No entries from this agent yet</p>
            <p className="text-[11px] text-slate-400">
              Run a failure injection or wait for real-time telemetry to trigger {agentFilter} agent events.
            </p>
          </div>
        ) : (
          filteredItems.map((act) => {
            const agent = getAgentInfo(act);

            return (
              <div
                key={act.id}
                className="flex items-start gap-2.5 p-2.5 bg-white border border-[#E5E9F0] rounded-lg shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Agent Avatar Circle (I/S/D/R) */}
                <div className={`w-7 h-7 rounded-full border ${agent.bg} flex items-center justify-center font-bold text-[11px] shrink-0 font-mono`}>
                  {agent.initial}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-900">{agent.name}</span>
                      {act.incident_id && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {act.incident_id}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.timestamp}</span>
                  </div>

                  <p className="text-[12px] text-slate-700 leading-snug font-sans">
                    {act.action}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  {act.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {act.status === 'IN_PROGRESS' && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                  {act.status === 'FAILED' && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
