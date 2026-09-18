import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Incident } from '../../types/incident';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Search, Filter, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { Card } from '../ui/Card';

interface IncidentTableProps {
  incidents?: Incident[];
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents = [] }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.incident_id.toLowerCase().includes(search.toLowerCase()) ||
      (inc.root_cause && inc.root_cause.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incidents by ID, title, or root cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="AWAITING_APPROVAL">Awaiting Approval</option>
            <option value="REMEDIATING">Remediating</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Incident ID</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Title & Root Cause</th>
              <th className="px-4 py-3">Services</th>
              <th className="px-4 py-3">AI Confidence</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((inc) => (
              <tr key={inc.incident_id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="px-4 py-3 font-bold text-indigo-400 whitespace-nowrap">
                  <Link to={`/incidents/${inc.incident_id}`} className="hover:underline">
                    {inc.incident_id}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <SeverityBadge severity={inc.severity} size="sm" />
                </td>
                <td className="px-4 py-3 max-w-lg">
                  <div className="font-semibold font-sans text-slate-100 text-sm group-hover:text-indigo-300 transition-colors">
                    {inc.title}
                  </div>
                  {inc.root_cause && (
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5 truncate">
                      Root: {inc.root_cause}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                  {inc.affected_services.join(', ')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {inc.confidence ? (
                    <span className="text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                      {inc.confidence}%
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={inc.status} size="sm" />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    to={`/incidents/${inc.incident_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Investigate <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
