import React from 'react';

export default function MetricCard({ label, value, icon, color = 'var(--text-primary)', onClick }) {
  return (
    <div 
      className="metric-card" 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.15s ease' }}
    >
      <div>
        <div className="metric-label">{label}</div>
        <div className="metric-val" style={{ color }}>{value}</div>
      </div>
      {icon && <div style={{ opacity: 0.8 }}>{icon}</div>}
    </div>
  );
}
