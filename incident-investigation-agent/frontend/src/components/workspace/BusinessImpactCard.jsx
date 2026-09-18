import React from 'react';
import { Briefcase } from 'lucide-react';

export default function BusinessImpactCard({ impact, service = 'payment-service' }) {
  const impactText = typeof impact === 'string' ? impact : JSON.stringify(impact || 'Evaluating...');
  const isHigh = impactText.toLowerCase().includes('critical') || impactText.toLowerCase().includes('high') || impactText.toLowerCase().includes('payment');

  return (
    <div 
      className="panel" 
      style={{ 
        borderColor: isHigh ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)',
        backgroundColor: isHigh ? 'rgba(245, 158, 11, 0.03)' : 'var(--bg-card)'
      }}
    >
      <div className="panel-header">
        <div className="panel-title" style={{ color: isHigh ? 'var(--status-amber)' : 'var(--text-secondary)' }}>
          <Briefcase size={16} /> Business Function &amp; User Impact
        </div>
        <span className={`badge ${isHigh ? 'badge-amber' : 'badge-cyan'}`}>
          {isHigh ? 'HIGH IMPACT' : 'MEDIUM IMPACT'}
        </span>
      </div>

      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '6px' }}>
        {impactText}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Affects target microservice: <strong style={{ color: 'var(--accent-cyan)' }}>{service}</strong>
      </div>
    </div>
  );
}
