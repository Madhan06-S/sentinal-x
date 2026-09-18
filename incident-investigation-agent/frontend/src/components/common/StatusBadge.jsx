import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, RefreshCw, XCircle, ShieldAlert } from 'lucide-react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const s = String(status).toUpperCase();

  let badgeClass = 'badge-open';
  let icon = <Clock size={12} />;

  switch (s) {
    case 'RESOLVED':
    case 'SUCCEEDED':
    case 'VERIFIED':
      badgeClass = 'badge-green';
      icon = <CheckCircle2 size={12} />;
      break;
    case 'AWAITING_APPROVAL':
    case 'WARNING':
      badgeClass = 'badge-amber';
      icon = <AlertTriangle size={12} />;
      break;
    case 'CRITICAL':
    case 'FAILED':
      badgeClass = 'badge-red';
      icon = <XCircle size={12} />;
      break;
    case 'INVESTIGATING':
    case 'REMEDIATING':
    case 'VERIFYING':
      badgeClass = 'badge-cyan';
      icon = <RefreshCw size={12} className="spin" />;
      break;
    case 'ESCALATED':
      badgeClass = 'badge-escalated';
      icon = <ShieldAlert size={12} />;
      break;
    default:
      badgeClass = 'badge-open';
      icon = <Clock size={12} />;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {icon} {s.replace('_', ' ')}
    </span>
  );
}
