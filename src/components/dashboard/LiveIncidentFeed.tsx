import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { Card } from '../ui/Card';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Incident } from '../../types/incident';

interface LiveIncidentFeedProps {
  incidents?: Incident[];
}

export const LiveIncidentFeed: React.FC<LiveIncidentFeedProps> = ({ incidents = [] }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-base font-bold text-slate-100">Live Incident Feed</span>
        </div>
      }
      subtitle="Real-time correlated incidents requiring attention"
      action={
        <Link to="/incidents" className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1">
          View All ({incidents.length}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3">
        {incidents.slice(0, 3).map((inc) => (
          <div
            key={inc.incident_id}
            className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{inc.incident_id}</span>
                  <SeverityBadge severity={inc.severity} size="sm" />
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {inc.title}
                </h4>
              </div>
              <Link
                to={`/incidents/${inc.incident_id}`}
                className="shrink-0 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg hover:bg-indigo-600 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {inc.root_cause && (
              <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800/80 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-mono font-medium text-slate-300 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" /> Root Cause:
                  </span>
                  {inc.confidence && (
                    <span className="font-mono text-[11px] text-purple-300 font-semibold bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800">
                      AI Confidence: {inc.confidence}%
                    </span>
                  )}
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">{inc.root_cause}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
