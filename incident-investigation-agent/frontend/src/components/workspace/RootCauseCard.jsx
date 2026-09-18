import React from 'react';
import { Target, HelpCircle } from 'lucide-react';

export default function RootCauseCard({ rootCause, reason, confidence }) {
  const isUnknown = !rootCause || rootCause === 'UNKNOWN' || rootCause.toLowerCase().includes('unknown');

  if (isUnknown) {
    return (
      <div className="panel" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-amber)', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
          <HelpCircle size={18} /> ROOT CAUSE UNKNOWN
        </div>

        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Insufficient Operational Evidence
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {reason || 'Available operational signals do not point conclusively to a root cause. The system has safely halted automated action to prevent unintended side effects.'}
        </p>

        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
          <span>Confidence: <strong style={{ color: 'var(--status-amber)' }}>{confidence ? `${(confidence * 100).toFixed(0)}%` : '15%'}</strong></span>
          <span>Recommendation: <strong style={{ color: 'var(--accent-purple)' }}>ESCALATE TO ON-CALL HUMAN OPERATOR</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className="panel" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', backgroundColor: 'rgba(6, 182, 212, 0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
        <Target size={18} /> PROBABLE ROOT CAUSE
      </div>

      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
        {rootCause}
      </div>

      {reason && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {reason}
        </p>
      )}
    </div>
  );
}
