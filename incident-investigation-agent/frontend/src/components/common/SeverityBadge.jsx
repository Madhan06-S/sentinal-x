import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function SeverityBadge({ severity }) {
  if (!severity) return null;
  const sev = String(severity).toUpperCase();

  let badgeClass = 'badge-info';
  let icon = <Info size={12} />;

  if (sev === 'CRITICAL') {
    badgeClass = 'badge-critical';
    icon = <ShieldAlert size={12} />;
  } else if (sev === 'HIGH') {
    badgeClass = 'badge-high';
    icon = <AlertCircle size={12} />;
  } else if (sev === 'MEDIUM') {
    badgeClass = 'badge-amber';
    icon = <AlertTriangle size={12} />;
  } else if (sev === 'LOW' || sev === 'INFO') {
    badgeClass = 'badge-cyan';
    icon = <Info size={12} />;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {icon} {sev}
    </span>
  );
}
