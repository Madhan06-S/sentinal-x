import React from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../common/StatusBadge';
import SeverityBadge from '../common/SeverityBadge';
import RiskBadge from '../common/RiskBadge';
import { Zap, Check, X, Play, RefreshCw } from 'lucide-react';

export default function IncidentHeader({ incident }) {
  const { triggerInvestigation, approveAction, rejectAction, executeRemediation, loading } = useApp();

  if (!incident) return null;

  const affectedService = incident.alerts && incident.alerts.length > 0 ? incident.alerts[0].service : 'Multiple Services';

  return (
    <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(13, 19, 34, 0.95))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span className="mono" style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
              {incident.id}
            </span>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            {incident.risk_level && <RiskBadge risk={incident.risk_level} />}
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {incident.title}
          </h1>

          <div style={{ display: 'flex', gap: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Affected Service: <strong style={{ color: 'var(--text-primary)' }}>{affectedService}</strong></span>
            <span>Created: <span className="mono">{new Date(incident.created_at).toLocaleString()}</span></span>
            {incident.resolved_at && (
              <span>Resolved: <span className="mono" style={{ color: 'var(--status-green)' }}>{new Date(incident.resolved_at).toLocaleString()}</span></span>
            )}
          </div>
        </div>

        {/* Dynamic Contextual Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {(incident.status === 'OPEN' || incident.status === 'FAILED') && (
            <button
              className="btn btn-primary"
              onClick={() => triggerInvestigation(incident.id)}
              disabled={loading.investigating}
            >
              {loading.investigating ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />} Run Groq &amp; RAG Investigation
            </button>
          )}

          {incident.status === 'AWAITING_APPROVAL' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-success"
                onClick={() => approveAction(incident.id)}
                disabled={loading.remediating}
              >
                <Check size={14} /> Approve ({incident.recommended_action})
              </button>
              <button
                className="btn btn-danger"
                onClick={() => rejectAction(incident.id)}
                disabled={loading.remediating}
              >
                <X size={14} /> Reject
              </button>
            </div>
          )}

          {(incident.status === 'DECISION_PENDING' || incident.status === 'REMEDIATING') && (
            <button
              className="btn btn-primary"
              onClick={() => executeRemediation(incident.id)}
              disabled={loading.remediating}
            >
              {loading.remediating ? <RefreshCw size={14} className="spin" /> : <Play size={14} />} Execute Safe Remediation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
