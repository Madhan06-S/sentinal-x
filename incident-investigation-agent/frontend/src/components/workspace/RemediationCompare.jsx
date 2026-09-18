import React from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';

export default function RemediationCompare({ incident }) {
  // Extract remediation result from audit logs if available
  const remediationAudit = (incident?.timeline || []).find(
    (log) => log.event_type === 'REMEDIATION_COMPLETED' || log.event_type === 'INCIDENT_RESOLVED'
  );

  const details = remediationAudit?.details || {};
  const beforeMetrics = details.metrics_before || {
    memory_percent: 94,
    db_connections_percent: 100,
    api_latency_ms: 4800,
    error_rate_percent: 31,
  };
  const afterMetrics = details.metrics_after || {
    memory_percent: 45,
    db_connections_percent: 42,
    api_latency_ms: 180,
    error_rate_percent: 0.8,
  };

  const isResolvedOrRemediated =
    incident?.status === 'RESOLVED' ||
    incident?.status === 'VERIFYING' ||
    incident?.status === 'REMEDIATING' ||
    remediationAudit;

  if (!isResolvedOrRemediated) return null;

  return (
    <div className="panel" style={{ borderColor: 'var(--accent-cyan)' }}>
      <div className="panel-header">
        <div className="panel-title" style={{ color: 'var(--accent-cyan)' }}>
          <Activity size={16} /> SIMULATED REMEDIATION METRIC TRANSITION
        </div>
        <span className="badge badge-green">
          <CheckCircle2 size={12} /> SIMULATION CONTROLLER SAFE
        </span>
      </div>

      <div className="compare-grid">
        {/* BEFORE Column */}
        <div className="compare-col">
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#fca5a5', textTransform: 'uppercase' }}>
            BEFORE REMEDIATION (DEGRADED):
          </h4>
          <div className="compare-row">
            <span>Memory Usage:</span>
            <span className="mono" style={{ color: 'var(--status-red)', fontWeight: '700' }}>
              {beforeMetrics.memory_percent}%
            </span>
          </div>
          <div className="compare-row">
            <span>DB Connections:</span>
            <span className="mono" style={{ color: 'var(--status-red)', fontWeight: '700' }}>
              {beforeMetrics.db_connections_percent}%
            </span>
          </div>
          <div className="compare-row">
            <span>API Latency:</span>
            <span className="mono" style={{ color: 'var(--status-red)', fontWeight: '700' }}>
              {beforeMetrics.api_latency_ms}ms
            </span>
          </div>
          <div className="compare-row">
            <span>Error Failure Rate:</span>
            <span className="mono" style={{ color: 'var(--status-red)', fontWeight: '700' }}>
              {beforeMetrics.error_rate_percent}%
            </span>
          </div>
        </div>

        {/* AFTER Column */}
        <div className="compare-col">
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#86efac', textTransform: 'uppercase' }}>
            AFTER ACTION ({incident.recommended_action || 'ROLLBACK_DEPLOYMENT'}):
          </h4>
          <div className="compare-row">
            <span>Memory Usage:</span>
            <span className="mono" style={{ color: 'var(--status-green)', fontWeight: '700' }}>
              {afterMetrics.memory_percent}%
            </span>
          </div>
          <div className="compare-row">
            <span>DB Connections:</span>
            <span className="mono" style={{ color: 'var(--status-green)', fontWeight: '700' }}>
              {afterMetrics.db_connections_percent}%
            </span>
          </div>
          <div className="compare-row">
            <span>API Latency:</span>
            <span className="mono" style={{ color: 'var(--status-green)', fontWeight: '700' }}>
              {afterMetrics.api_latency_ms}ms
            </span>
          </div>
          <div className="compare-row">
            <span>Error Failure Rate:</span>
            <span className="mono" style={{ color: 'var(--status-green)', fontWeight: '700' }}>
              {afterMetrics.error_rate_percent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
