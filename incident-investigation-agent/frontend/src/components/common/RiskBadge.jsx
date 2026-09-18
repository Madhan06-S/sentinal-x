import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarning } from 'lucide-react';

export default function RiskBadge({ risk }) {
  if (!risk) return null;
  const r = String(risk).toUpperCase();

  let badgeClass = 'badge-green';
  let icon = <ShieldCheck size={12} />;

  if (r === 'HIGH') {
    badgeClass = 'badge-red';
    icon = <ShieldAlert size={12} />;
  } else if (r === 'MEDIUM') {
    badgeClass = 'badge-amber';
    icon = <ShieldWarning size={12} />;
  } else if (r === 'LOW') {
    badgeClass = 'badge-green';
    icon = <ShieldCheck size={12} />;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {icon} {r} RISK
    </span>
  );
}
