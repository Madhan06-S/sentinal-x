import React from 'react';
import { History } from 'lucide-react';

export default function IncidentAuditTrail({ timeline = [] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <History size={16} /> Incident Lifecycle Audit Log ({timeline.length})
        </div>
      </div>

      {timeline.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
          No audit entries recorded for this incident lifecycle yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {timeline.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 200px 1fr',
                gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '12px',
                alignItems: 'center',
              }}
            >
              <span className="mono" style={{ color: 'var(--text-muted)' }}>
                {new Date(item.created_at).toLocaleTimeString()}
              </span>
              <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>
                {item.event_type}
              </span>
              <span className="mono" style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.details ? JSON.stringify(item.details) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
