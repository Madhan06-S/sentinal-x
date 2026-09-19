import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Activity, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Incident } from '../../types/incident';

interface LiveIncidentFeedProps {
  incidents?: Incident[];
  onSelectIncident?: (incident: Incident) => void;
}

const formatAge = (timeStr?: string) => {
  if (!timeStr) return '2m ago';
  const diff = Date.now() - new Date(timeStr).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
};

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
        <div className="flex items-center gap-2 font-sans">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-[14px] font-bold text-slate-900">Live Incident Feed</span>
        </div>
      }
      subtitle="Real-time production incidents & active root cause hypothesis"
      action={
        <Link to="/incidents" className="text-[12px] text-blue-600 hover:text-blue-700 font-mono font-medium flex items-center gap-1">
          View All ({incidents.length}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3 font-sans">
        {incidents.slice(0, 4).map((inc) => {
          const borderClass = leftBorderMap[inc.severity] || 'border-l-4 border-l-blue-600';
          const affectedServices = inc.affected_services || ['payment-service'];

          return (
            <div
              key={inc.incident_id}
              onClick={() => onSelectIncident && onSelectIncident(inc)}
              className={`p-3.5 bg-white border border-[#E5E9F0] ${borderClass} rounded-xl shadow-card hover:shadow-card-hover hover:border-[#D5DBE5] transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {inc.incident_id}
                    </span>
                    <SeverityBadge severity={inc.severity} size="sm" />
                    <StatusBadge status={inc.status} size="sm" />
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="w-3 h-3" />
                      {formatAge(inc.created_at)}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors pt-0.5">
                    {inc.title}
                  </h4>
                </div>
                <div className="shrink-0 p-1 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Service Chips */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Affected:</span>
                {affectedServices.map((svc) => (
                  <span
                    key={svc}
                    className="text-[10px] font-mono font-medium text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"
                  >
                    {svc}
                  </span>
                ))}
              </div>

              {inc.root_cause && (
                <div className="mt-2.5 p-2.5 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg text-[12px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono font-medium text-slate-700 flex items-center gap-1.5 text-[11px]">
                      <Shield className="w-3.5 h-3.5 text-blue-600" /> Root Cause:
                    </span>
                    {inc.confidence && (
                      <span className="font-mono text-[10px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {inc.confidence}% Confidence
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[12px]">{inc.root_cause}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
