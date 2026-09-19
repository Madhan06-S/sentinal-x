import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Incident } from '../../types/incident';

interface LiveIncidentFeedProps {
  incidents?: Incident[];
  onSelectIncident?: (incident: Incident) => void;
}

export const LiveIncidentFeed: React.FC<LiveIncidentFeedProps> = ({ incidents = [], onSelectIncident }) => {
  const leftBorderMap = {
    CRITICAL: 'border-l-4 border-l-red-600',
    HIGH: 'border-l-4 border-l-amber-600',
    MEDIUM: 'border-l-4 border-l-blue-600',
    LOW: 'border-l-4 border-l-slate-400',
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-600" />
          <span className="text-[15px] font-bold text-slate-900 font-sans">Live Incident Feed</span>
        </div>
      }
      subtitle="Real-time correlated incidents requiring attention"
      action={
        <Link to="/incidents" className="text-[12px] text-blue-600 hover:text-blue-700 font-mono font-medium flex items-center gap-1">
          View All ({incidents.length}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3">
        {incidents.slice(0, 3).map((inc) => {
          const borderClass = leftBorderMap[inc.severity] || 'border-l-4 border-l-blue-600';

          return (
            <div
              key={inc.incident_id}
              onClick={() => onSelectIncident && onSelectIncident(inc)}
              className={`p-4 bg-white border border-[#E5E9F0] ${borderClass} rounded-[10px] shadow-card hover:shadow-card-hover hover:border-[#D5DBE5] transition-all cursor-pointer group font-sans`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[12px] font-bold text-blue-600">{inc.incident_id}</span>
                    <SeverityBadge severity={inc.severity} size="sm" />
                    <StatusBadge status={inc.status} size="sm" />
                  </div>
                  <h4 className="text-[14px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {inc.title}
                  </h4>
                </div>
                <div className="shrink-0 p-1.5 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-lg transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {inc.root_cause && (
                <div className="mt-3 p-3 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg text-[12px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono font-medium text-slate-700 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Root Cause Hypothesis:
                    </span>
                    {inc.confidence && (
                      <span className="font-mono text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {inc.confidence}% Confidence
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 font-sans leading-relaxed text-[12px]">{inc.root_cause}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
