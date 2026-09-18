import React from 'react';
import SeverityBadge from '../common/SeverityBadge';
import { Layers } from 'lucide-react';

export default function CorrelatedSignals({ alerts = [] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Layers size={16} /> Correlated Operational Telemetry Signals ({alerts.length})
        </div>
      </div>

      {alerts.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
          No correlated telemetry signals linked to this incident.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map((evt) => (
            <div
              key={evt.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
                <SeverityBadge severity={evt.severity} />
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {evt.message}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '14px' }}>
                <span>Source: <strong>{evt.source}</strong></span>
                <span>Service: <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>{evt.service}</strong></span>
                <span>Code: <code className="mono">{evt.error_code || 'N/A'}</code></span>
                <span>Filter: <strong style={{ color: 'var(--status-green)' }}>{evt.status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
