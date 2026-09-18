import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Bell, X } from 'lucide-react';
import { realtimeService } from '../../services/realtime';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'success' | 'info';
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((event) => {
      let toast: ToastItem | null = null;

      if (event.type === 'NEW_ALERT') {
        toast = {
          id: `t-${Date.now()}`,
          title: '🚨 New Critical Alert Received',
          message: `${event.payload.service}: ${event.payload.message}`,
          type: 'critical',
        };
      } else if (event.type === 'NEW_INCIDENT') {
        toast = {
          id: `t-${Date.now()}`,
          title: '🔥 New Incident Created',
          message: `${event.payload.incident_id}: ${event.payload.title}`,
          type: 'warning',
        };
      } else if (event.type === 'INCIDENT_UPDATED' && event.payload?.status === 'AWAITING_APPROVAL') {
        toast = {
          id: `t-${Date.now()}`,
          title: '⚠️ Human Approval Required',
          message: `AI recommends ${event.payload.recommended_action} for ${event.payload.incident_id}`,
          type: 'warning',
        };
      } else if (event.type === 'INCIDENT_UPDATED' && event.payload?.status === 'RESOLVED') {
        toast = {
          id: `t-${Date.now()}`,
          title: '✅ Incident Fully Resolved',
          message: `${event.payload.incident_id} verified and recovered successfully`,
          type: 'success',
        };
      }

      if (toast) {
        setToasts((prev) => [toast!, ...prev.slice(0, 4)]);
        setTimeout(() => {
          const targetId = toast!.id;
          setToasts((prev) => prev.filter((t) => t.id !== targetId));
        }, 6000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 p-4 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-lg animate-fade-in"
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {t.type === 'warning' && <Bell className="w-5 h-5 text-amber-500" />}
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100">{t.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-200 shrink-0 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
