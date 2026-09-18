import React from 'react';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Incident } from '../../types/incident';
import { Clock, ShieldAlert, Cpu, DollarSign, Layers } from 'lucide-react';

interface IncidentHeaderProps {
  incident: Incident;
}

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({ incident }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg font-bold text-indigo-400 tracking-wider">
              {incident.incident_id}
            </span>
            <SeverityBadge severity={incident.severity} size="lg" />
            <StatusBadge status={incident.status} size="lg" />

            {incident.confidence && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                <Cpu className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                AI Confidence: {incident.confidence}%
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{incident.title}</h1>
        </div>

        {/* Affected Services Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Services:
          </span>
          {incident.affected_services.map((srv) => (
            <span
              key={srv}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
            >
              {srv}
            </span>
          ))}
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
        <div>
          <span className="text-slate-400 block mb-0.5">Created At</span>
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {new Date(incident.created_at).toLocaleTimeString()}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Business Impact</span>
          <span className="text-red-400 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            {incident.business_impact_summary || 'High Impact'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Estimated Risk</span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            ${incident.business_impact_details?.estimated_financial_risk_usd?.toLocaleString() || '42,000'}/hr
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Recommended Action</span>
          <span className="text-indigo-300 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800 inline-block">
            {incident.recommended_action || 'EVALUATING'}
          </span>
        </div>
      </div>
    </div>
  );
};
