import React from 'react';
import RiskBadge from '../common/RiskBadge';
import { ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';

export default function DecisionPanel({ action, riskLevel, approvalRequired, reason }) {
  const isHighRisk = riskLevel === 'HIGH' || approvalRequired;

  return (
    <div className="panel" style={{ borderColor: isHighRisk ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)' }}>
      <div className="panel-header">
        <div className="panel-title">
          <ShieldCheck size={16} /> Layer 2 Policy Engine Recommendation
        </div>
        {riskLevel && <RiskBadge risk={riskLevel} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            RECOMMENDED ACTION
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '2px' }} className="mono">
            {action || 'NO_ACTION'}
          </div>
        </div>

        {approvalRequired && (
          <div className="badge badge-amber" style={{ padding: '6px 12px' }}>
            <AlertTriangle size={12} /> HUMAN APPROVAL MANDATED
          </div>
        )}
      </div>

      {reason && (
        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', lineHeight: '1.5' }}>
          <strong>Policy Reasoning:</strong> {reason}
        </div>
      )}
    </div>
  );
}
