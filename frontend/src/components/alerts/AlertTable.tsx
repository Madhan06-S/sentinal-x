import React, { useState } from 'react';
import { Alert, AlertFilters, AlertSeverity } from '../../types/alert';
import { SeverityBadge } from '../ui/Badge';
import { Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';

interface AlertTableProps {
  alerts?: Alert[];
  onSelectAlert?: (alert: Alert) => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts = [], onSelectAlert }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');

  const services = Array.from(new Set(alerts.map((a) => a.service)));

  const filtered = alerts.filter((a) => {
    const matchesSearch =
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesService = serviceFilter === 'ALL' || a.service === serviceFilter;
    return matchesSearch && matchesSeverity && matchesService;
  });

  return (
    <Card className="p-0 overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by message, service, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
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

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Services</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Alert Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((alt) => (
              <tr
                key={alt.id}
                onClick={() => onSelectAlert && onSelectAlert(alt)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(alt.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <SeverityBadge severity={alt.severity} size="sm" />
                </td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{alt.source}</td>
                <td className="px-4 py-3 text-indigo-300 font-bold whitespace-nowrap">{alt.service}</td>
                <td className="px-4 py-3 text-slate-200 font-sans max-w-md truncate">{alt.message}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                    {alt.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-purple-400 whitespace-nowrap">
                  {alt.incident_id || '—'}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <ChevronRight className="w-4 h-4 text-slate-500 inline group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
