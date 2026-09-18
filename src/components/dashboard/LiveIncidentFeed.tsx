import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Cpu, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { ConfidenceSparkline } from '../incidents/ConfidenceSparkline';
import { Incident } from '../../types/incident';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface LiveIncidentFeedProps {
  incidents?: Incident[];
  autonomyLevel?: number;
  onApproveIncident?: (id: string) => void;
}

export const LiveIncidentFeed: React.FC<LiveIncidentFeedProps> = ({
  incidents = [],
  autonomyLevel = 3,
  onApproveIncident,
}) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-base font-bold text-zinc-100 font-sans">Live Correlated Incident Feed</span>
        </div>
      }
      subtitle="AI-grouped incidents with confidence evolution sparkline & action triggers"
      action={
        <Link to="/incidents" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1">
          View All ({incidents.length}) <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-4">
        {incidents.slice(0, 3).map((inc) => (
          <div
            key={inc.incident_id}
            className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl hover:border-cyan-500/40 transition-all group space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs font-bold text-cyan-400">{inc.incident_id}</span>
                  <SeverityBadge severity={inc.severity} size="sm" />
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                <h4 className="text-sm font-semibold font-sans text-zinc-100 group-hover:text-cyan-300 transition-colors">
                  {inc.title}
                </h4>
              </div>

              <Link
                to={`/incidents/${inc.incident_id}`}
                className="shrink-0 p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg hover:bg-cyan-600 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3: Confidence Evolution Sparkline */}
            <ConfidenceSparkline
              confidenceData={[25, 42, 68, 85, inc.confidence || 94]}
              finalConfidence={inc.confidence || 94}
            />

            {/* Root Cause & Actions */}
            {inc.root_cause && (
              <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" /> Root Cause:
                  </span>
                  <span className="text-amber-400 font-bold">{inc.recommended_action || 'ROLLBACK'}</span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">{inc.root_cause}</p>

                {/* Autonomy Level 3: Pulsing Amber APPROVE button */}
                {autonomyLevel >= 3 && inc.status === 'AWAITING_APPROVAL' && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> L3 Approval Required
                    </span>
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={() => onApproveIncident && onApproveIncident(inc.incident_id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      className="bg-amber-600 hover:bg-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.5)] animate-pulse"
                    >
                      APPROVE REMEDIATION
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
