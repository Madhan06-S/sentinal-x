import React, { useState } from 'react';
import { AuditEntry } from '../../types/audit';
import { ShieldCheck, Bot, User, CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight, Download, FileText, Filter, Search } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AuditTableProps {
  auditLogs?: AuditEntry[];
}

export const AuditTable: React.FC<AuditTableProps> = ({ auditLogs = [] }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actorFilter, setActorFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.incident_id && log.incident_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesActor = actorFilter === 'ALL' || log.actor_type === actorFilter;

    return matchesSearch && matchesActor;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis-audit-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const caseVerdictCards = [
    {
      id: 'CASE-8942',
      title: 'PostgreSQL Connection Pool Exhaustion',
      verdict: 'AUTONOMOUSLY MITIGATED',
      duration: '42s',
      actor: 'Aegis AI Agent',
      remediation: 'Restarted connection pooler & flushed leaked handles',
      status: 'success' as const,
    },
    {
      id: 'CASE-8939',
      title: 'Memory Leak on Order Service v2.3.9',
      verdict: 'ROLLBACK APPROVED BY OPERATOR',
      duration: '1m 14s',
      actor: 'Sarah Jenkins (SRE)',
      remediation: 'Rolled back deployment to v2.3.8-stable',
      status: 'info' as const,
    },
    {
      id: 'CASE-8931',
      title: 'Redis Cache Eviction Spike',
      verdict: 'AUTO-SCALED CLUSTER',
      duration: '28s',
      actor: 'Aegis AI Agent',
      remediation: 'Scaled cache node memory limits to 16GB',
      status: 'success' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Case File Verdict Cards */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600" /> Recent Resolved Incident Verdict Summaries
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {caseVerdictCards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600">{card.id}</span>
                <StatusBadge status={card.status} text={card.verdict} />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">{card.title}</h4>
              <p className="text-xs text-slate-600 font-sans">{card.remediation}</p>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                <span>Actor: {card.actor}</span>
                <span>Time to Resolve: {card.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search action, actor, resource, or incident ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
              <button
                onClick={() => setActorFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${actorFilter === 'ALL' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setActorFilter('AI_ENGINE')}
                className={`px-2.5 py-1 rounded transition-colors ${actorFilter === 'AI_ENGINE' ? 'bg-white text-purple-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                AI Engine
              </button>
              <button
                onClick={() => setActorFilter('ENGINEER')}
                className={`px-2.5 py-1 rounded transition-colors ${actorFilter === 'ENGINEER' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Human SRE
              </button>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleExportJSON} icon={Download}>
            Export Audit JSON
          </Button>
        </div>

        {/* Data Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="w-8 px-3 py-3"></th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action Executed</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">Incident ID</th>
                <th className="px-4 py-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-3 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {log.actor_type === 'AI_ENGINE' ? (
                            <span className="p-1 rounded bg-purple-100 text-purple-700 border border-purple-200">
                              <Bot className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded bg-blue-100 text-blue-700 border border-blue-200">
                              <User className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className="text-slate-900 font-semibold">{log.actor}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-sans font-medium">{log.action}</td>
                      <td className="px-4 py-3 text-blue-600 font-bold whitespace-nowrap">{log.resource}</td>
                      <td className="px-4 py-3 text-purple-600 font-bold whitespace-nowrap">{log.incident_id || '—'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {log.result === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> FAILURE
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable JSON Detail */}
                    {isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={7} className="px-6 py-4 border-t border-slate-200">
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500 block">
                              Raw Audit Event Payload (JSON)
                            </span>
                            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                              {JSON.stringify(log.details || { event_id: log.id, actor: log.actor, resource: log.resource, timestamp: log.timestamp }, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

