import React from 'react';
import { AuditEntry } from '../../types/audit';
import { ShieldCheck, Bot, User, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

interface AuditTableProps {
  auditLogs?: AuditEntry[];
}

export const AuditTable: React.FC<AuditTableProps> = ({ auditLogs = [] }) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor / Type</th>
              <th className="px-4 py-3">Action Executed</th>
              <th className="px-4 py-3">Target Resource</th>
              <th className="px-4 py-3">Incident ID</th>
              <th className="px-4 py-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {log.actor_type === 'AI_ENGINE' ? (
                      <span className="p-1 rounded bg-purple-950 text-purple-400 border border-purple-800">
                        <Bot className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                        <User className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-slate-200 font-semibold">{log.actor}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-100 font-sans font-medium">{log.action}</td>
                <td className="px-4 py-3 text-indigo-300 font-bold whitespace-nowrap">{log.resource}</td>
                <td className="px-4 py-3 text-purple-400 font-bold whitespace-nowrap">{log.incident_id || '—'}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {log.result === 'SUCCESS' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> FAILURE
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
