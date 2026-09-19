import React, { useState } from 'react';
import { Deployment } from '../../types/deployment';
import { GitCommit, AlertTriangle, CheckCircle2, RotateCcw, Clock, User, Layers, ListFilter, GitBranch } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DeploymentTableProps {
  deployments?: Deployment[];
  onDeployClick?: () => void;
}

export const DeploymentTable: React.FC<DeploymentTableProps> = ({ deployments = [], onDeployClick }) => {
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL':
        return <StatusBadge status="success" text="SUCCESSFUL" />;
      case 'FAILED':
        return <StatusBadge status="danger" text="FAILED" />;
      case 'ROLLED_BACK':
        return <StatusBadge status="info" text="ROLLED BACK" />;
      case 'IN_PROGRESS':
        return <StatusBadge status="warning" text="IN PROGRESS" />;
      case 'SUSPECTED':
      case 'FAULTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-100 text-red-700 border border-red-200 shadow-xs">
            <AlertTriangle className="w-3 h-3" /> FAULTY / SUSPECTED
          </span>
        );
      default:
        return <StatusBadge status="neutral" text={status} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header & View Switcher */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 uppercase font-semibold">Deployment View:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md text-xs font-medium font-mono transition-all ${
                viewMode === 'timeline' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vertical Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-xs font-medium font-mono transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Table
            </button>
          </div>
        </div>

        {onDeployClick && (
          <Button variant="primary" size="sm" onClick={onDeployClick} icon={GitCommit}>
            Deploy New Version
          </Button>
        )}
      </div>

      {viewMode === 'timeline' ? (
        /* Vertical Timeline View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 relative">
          <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-slate-200" />
          <div className="space-y-6 relative">
            {deployments.map((dep) => (
              <div key={dep.id} className="flex items-start gap-6 group">
                {/* Timeline Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-mono text-xs font-bold border ${
                  dep.status === 'SUSPECTED' || dep.status === 'FAILED'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  <GitBranch className="w-4 h-4" />
                </div>

                {/* Timeline Card */}
                <div className="flex-1 bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{dep.service}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-xs font-semibold">
                        {dep.version}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono text-[11px]">
                        {dep.commit_hash}
                      </span>
                    </div>
                    <div>{getStatusBadge(dep.status)}</div>
                  </div>

                  <p className="text-xs text-slate-700 font-sans mb-3">{dep.change_summary}</p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200/80">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {dep.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(dep.timestamp).toLocaleString()}
                    </span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-600">
                      {dep.environment}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Commit Hash</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Deployed At</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-blue-600 whitespace-nowrap flex items-center gap-1.5">
                      <GitCommit className="w-4 h-4 text-blue-500" /> {dep.commit_hash}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">{dep.service}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{dep.version}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{dep.environment}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{dep.author}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(dep.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-sans max-w-sm truncate">{dep.change_summary}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{getStatusBadge(dep.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

