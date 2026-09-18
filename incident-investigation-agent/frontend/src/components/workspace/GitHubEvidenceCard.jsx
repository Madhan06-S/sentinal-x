import React from 'react';
import { GitCommit, GitBranch } from 'lucide-react';

export default function GitHubEvidenceCard({ incident }) {
  // Check if there are deployment or git commit signals in incident alerts
  const gitEvents = (incident?.alerts || []).filter(
    (a) => a.alert_type === 'deployment' || a.source === 'github' || (a.message || '').toLowerCase().includes('deploy')
  );

  return (
    <div className="panel" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
      <div className="panel-header">
        <div className="panel-title" style={{ color: 'var(--accent-purple)' }}>
          <GitCommit size={16} /> GitHub Development Context &amp; Commit Evidence
        </div>
        <span className="badge badge-escalated">GIT TELEMETRY</span>
      </div>

      {gitEvents.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
          No recent GitHub push or deployment activity detected prior to signal ingestion.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {gitEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="mono" style={{ color: '#c4b5fd', fontWeight: '700' }}>
                  <GitBranch size={12} inline /> main / release
                </span>
                <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {evt.message}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Source: {evt.source} | Version: <code className="mono">{evt.meta?.version || 'v2.4.1'}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
