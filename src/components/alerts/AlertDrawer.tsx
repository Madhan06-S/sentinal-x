import React from 'react';
import { Alert } from '../../types/alert';
import { SeverityBadge } from '../ui/Badge';
import { X, Clock, Server, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface AlertDrawerProps {
  alert: Alert | null;
  onClose: () => void;
}

export const AlertDrawer: React.FC<AlertDrawerProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="font-mono text-xs font-bold text-indigo-400">{alert.id}</span>
              <h3 className="text-base font-bold text-slate-100">{alert.alert_type}</h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Severity</span>
              <SeverityBadge severity={alert.severity} size="sm" />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="text-indigo-300 font-bold">{alert.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="text-slate-200">{alert.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{new Date(alert.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Related Incident:</span>
                <span className="text-purple-400 font-bold">{alert.incident_id || 'None'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-sans">
              <span className="text-xs font-mono font-semibold text-slate-300 uppercase">Alert Payload</span>
              <p className="text-xs text-slate-200 leading-relaxed">{alert.message}</p>
            </div>

            {alert.metadata && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-semibold text-purple-400 uppercase">Raw Metadata JSON</span>
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto">
                  {JSON.stringify(alert.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
