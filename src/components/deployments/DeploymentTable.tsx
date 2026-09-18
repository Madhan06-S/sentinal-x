import React from 'react';
import { Deployment } from '../../types/deployment';
import { GitCommit, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';

interface DeploymentTableProps {
  deployments?: Deployment[];
}

export const DeploymentTable: React.FC<DeploymentTableProps> = ({ deployments = [] }) => {
  const statusBadges = {
    SUCCESSFUL: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    FAILED: 'bg-red-950/60 text-red-400 border-red-800/60',
    ROLLED_BACK: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
    IN_PROGRESS: 'bg-purple-950/60 text-purple-300 border-purple-800/60 animate-pulse',
    SUSPECTED: 'bg-red-950/80 text-red-300 border-red-700 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Commit / Hash</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Environment</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Change Summary</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {deployments.map((dep) => (
              <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-bold text-cyan-400 whitespace-nowrap flex items-center gap-1.5">
                  <GitCommit className="w-4 h-4" /> {dep.commit_hash}
                </td>
                <td className="px-4 py-3 font-bold text-indigo-300 whitespace-nowrap">{dep.service}</td>
                <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{dep.version}</td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{dep.environment}</td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{dep.author}</td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(dep.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 text-slate-300 font-sans max-w-sm truncate">{dep.change_summary}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${statusBadges[dep.status]}`}>
                    {dep.status === 'SUSPECTED' ? '⚠ SUSPECTED' : dep.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
