import React from 'react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../common/MetricCard';
import StatusBadge from '../common/StatusBadge';
import SeverityBadge from '../common/SeverityBadge';
import EmptyState from '../common/EmptyState';
import { AlertOctagon, ShieldAlert, Clock, RefreshCw, CheckCircle2, ArrowRight, Activity, Radio } from 'lucide-react';

export default function DashboardView() {
  const { incidents, alerts, setActiveIncidentId, setActivePage } = useApp();

  const totalActive = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'FAILED').length;
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const awaitingApprovalCount = incidents.filter((i) => i.status === 'AWAITING_APPROVAL').length;
  const investigatingCount = incidents.filter((i) => i.status === 'INVESTIGATING').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          label="Active Incidents"
          value={totalActive}
          icon={<AlertOctagon size={24} style={{ color: 'var(--accent-cyan)' }} />}
          color={totalActive > 0 ? 'var(--accent-cyan)' : 'var(--text-primary)'}
          onClick={() => setActivePage('incidents')}
        />
        <MetricCard
          label="Critical Severity"
          value={criticalCount}
          icon={<ShieldAlert size={24} style={{ color: 'var(--status-red)' }} />}
          color={criticalCount > 0 ? 'var(--status-red)' : 'var(--text-primary)'}
          onClick={() => setActivePage('incidents')}
        />
        <MetricCard
          label="Awaiting Approval"
          value={awaitingApprovalCount}
          icon={<Clock size={24} style={{ color: 'var(--status-amber)' }} />}
          color={awaitingApprovalCount > 0 ? 'var(--status-amber)' : 'var(--text-primary)'}
          onClick={() => setActivePage('incidents')}
        />
        <MetricCard
          label="Investigating"
          value={investigatingCount}
          icon={<RefreshCw size={24} style={{ color: 'var(--accent-blue)' }} />}
          color="var(--accent-blue)"
          onClick={() => setActivePage('incidents')}
        />
        <MetricCard
          label="Resolved Incidents"
          value={resolvedCount}
          icon={<CheckCircle2 size={24} style={{ color: 'var(--status-green)' }} />}
          color="var(--status-green)"
          onClick={() => setActivePage('incidents')}
        />
      </div>

      {/* Main Grid: Active Incidents + Live Signals */}
      <div className="workspace-grid">
        {/* Active Incidents Overview */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Activity size={16} /> Recent Incidents ({incidents.length})
            </div>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setActivePage('incidents')}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          {incidents.length === 0 ? (
            <EmptyState
              title="No Incidents Record"
              description="System is operating cleanly. Trigger a demo scenario from the top bar to simulate live incidents."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {incidents.slice(0, 5).map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    backgroundColor: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setActiveIncidentId(inc.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="mono" style={{ fontWeight: '700', color: 'var(--accent-cyan)', fontSize: '13px' }}>
                        {inc.id}
                      </span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {inc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Created: {new Date(inc.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <StatusBadge status={inc.status} />
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Signal Telemetry */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Radio size={16} /> Live Ingested Telemetry ({alerts.length})
            </div>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setActivePage('events')}>
              View Console <ArrowRight size={12} />
            </button>
          </div>

          {alerts.length === 0 ? (
            <EmptyState
              title="No Ingested Signals"
              description="Waiting for incoming telemetry events from monitored microservices."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alerts.slice(0, 6).map((evt) => (
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
                    <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
                      {evt.service}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                    {evt.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span>Source: {evt.source}</span>
                    <span>Code: <code className="mono">{evt.error_code || 'N/A'}</code></span>
                    <span>Status: <strong style={{ color: 'var(--status-green)' }}>{evt.status}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
