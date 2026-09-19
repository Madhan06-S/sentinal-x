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
          title: 'New Critical Alert Received',
          message: `${event.payload.service}: ${event.payload.message}`,
          type: 'critical',
        };
      } else if (event.type === 'NEW_INCIDENT') {
        toast = {
          id: `t-${Date.now()}`,
          title: 'New Incident Created',
          message: `${event.payload.incident_id}: ${event.payload.title}`,
          type: 'warning',
        };
      } else if (event.type === 'INCIDENT_UPDATED' && event.payload?.status === 'AWAITING_APPROVAL') {
        toast = {
          id: `t-${Date.now()}`,
          title: 'Human Approval Required',
          message: `AI recommends ${event.payload.recommended_action} for ${event.payload.incident_id}`,
          type: 'warning',
        };
      } else if (event.type === 'INCIDENT_UPDATED' && event.payload?.status === 'RESOLVED') {
        toast = {
          id: `t-${Date.now()}`,
          title: 'Incident Fully Resolved',
          message: `${event.payload.incident_id} verified and recovered successfully`,
          type: 'success',
        };
      }

      if (toast) {
        setToasts((prev) => [toast!, ...prev.slice(0, 3)]);
        setTimeout(() => {
          const targetId = toast!.id;
          setToasts((prev) => prev.filter((t) => t.id !== targetId));
        }, 4000);
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

  const leftBorderMap = {
    critical: 'border-l-4 border-l-red-600',
    warning: 'border-l-4 border-l-amber-600',
    success: 'border-l-4 border-l-emerald-600',
    info: 'border-l-4 border-l-blue-600',
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-white border border-[#E5E9F0] ${leftBorderMap[t.type]} rounded-[10px] shadow-dropdown animate-fade-in font-sans`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {t.type === 'warning' && <Bell className="w-4 h-4 text-amber-600" />}
            {t.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-semibold text-slate-900">{t.title}</h4>
            <p className="text-[12px] text-slate-600 mt-0.5 leading-snug">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-600 shrink-0 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
