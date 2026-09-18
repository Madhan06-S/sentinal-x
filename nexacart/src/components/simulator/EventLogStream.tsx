import React, { useState } from 'react';
import { StructuredIncidentEvent } from '../../types/incident';
import { Terminal, Copy, Check, ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface EventLogStreamProps {
  events: StructuredIncidentEvent[];
}

export const EventLogStream: React.FC<EventLogStreamProps> = ({ events }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0])); // expand newest by default
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const copyJson = (e: React.MouseEvent, event: StructuredIncidentEvent, idx: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const filteredEvents = events.filter((ev) => {
    if (severityFilter === 'ALL') return true;
    return ev.severity === severityFilter;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-hidden shadow-card font-mono text-xs">
      {/* Header Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-100">Live Structured Event Stream (POST /api/events)</span>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {events.length} telemetry records
          </span>
        </div>

        {/* Severity filter buttons */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-1 rounded text-[10px] transition-colors ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Event Records List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60 p-1">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-sans">
            <p className="text-sm font-medium">No events recorded yet.</p>
            <p className="text-xs text-slate-600 mt-1">
              Click &quot;Start Incident&quot; above to simulate the telemetry sequence.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const isExpanded = expandedIndices.has(idx);
            const timeStr = new Date(ev.timestamp).toLocaleTimeString();

            return (
              <div
                key={idx}
                onClick={() => toggleExpand(idx)}
                className="p-3 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                {/* Log Line Summary */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-500 text-[11px] shrink-0">{timeStr}</span>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getSeverityStyle(
                        ev.severity
                      )}`}
                    >
                      {ev.severity}
                    </span>

                    <span className="font-bold text-indigo-400 shrink-0">{ev.error_code}</span>

                    <span className="text-slate-400 text-[11px] shrink-0 font-sans">[{ev.service}]</span>

                    <span className="text-slate-200 truncate font-sans text-xs">{ev.message}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => copyJson(e, ev, idx)}
                      title="Copy structured JSON payload"
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Raw JSON View */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 bg-slate-900/90 rounded p-3 text-[11px] text-slate-300 overflow-x-auto">
                    <pre className="font-mono text-emerald-400/90">
                      {JSON.stringify(ev, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
