import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, X, ShieldAlert } from 'lucide-react';

export default function HumanApprovalCard({ incident }) {
  const { approveAction, rejectAction, loading } = useApp();
  const [operatorName, setOperatorName] = useState('Senior Site Reliability Engineer');
  const [comment, setComment] = useState('Approved deployment rollback to mitigate DB connection leak');

  if (!incident || incident.status !== 'AWAITING_APPROVAL') return null;

  return (
    <div
      className="panel"
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.06)',
        border: '1px solid rgba(245, 158, 11, 0.5)',
        boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
      }}
    >
      <div className="panel-header" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <div className="panel-title" style={{ color: 'var(--status-amber)' }}>
          <ShieldAlert size={18} /> ⚠ MANDATORY HUMAN APPROVAL REQUIRED
        </div>
        <span className="badge badge-amber">HIGH RISK POLICY GUARDRAIL</span>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px' }}>
        Recommended High-Risk Action: <code className="mono" style={{ color: 'var(--accent-cyan)' }}>{incident.recommended_action}</code>
      </div>

      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
        The policy engine classified this remediation action as <strong>HIGH RISK</strong>. Automated execution is blocked. A human operator must review the investigation hypotheses and explicitly approve or reject this action.
      </p>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Operator Identity
          </label>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%' }}
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Approval Rationale / Comment
          </label>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%' }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-danger"
          onClick={() => rejectAction(incident.id, operatorName, comment)}
          disabled={loading.remediating}
        >
          <X size={16} /> Reject Action
        </button>

        <button
          className="btn btn-success"
          onClick={() => approveAction(incident.id, operatorName, comment)}
          disabled={loading.remediating}
        >
          <Check size={16} /> Approve &amp; Execute ({incident.recommended_action})
        </button>
      </div>
    </div>
  );
}
