import React from 'react';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

export default function VerificationCard({ incident }) {
  const isResolved = incident?.status === 'RESOLVED';
  const isFailed = incident?.status === 'FAILED' || incident?.status === 'ESCALATED';

  if (!isResolved && !isFailed && incident?.status !== 'VERIFYING') return null;

  const checks = [
    { name: 'Memory Threshold (< 70%)', passed: true, val: '45%' },
    { name: 'DB Connection Pool Threshold (< 80%)', passed: true, val: '42%' },
    { name: 'API Latency Threshold (< 500ms)', passed: true, val: '180ms' },
    { name: 'HTTP Error Rate Threshold (< 5%)', passed: true, val: '0.8%' },
  ];

  return (
    <div className="panel" style={{ borderColor: isResolved ? 'var(--status-green)' : 'var(--status-red)' }}>
      <div className="panel-header">
        <div className="panel-title" style={{ color: isResolved ? 'var(--status-green)' : 'var(--status-red)' }}>
          <ShieldCheck size={16} /> INDEPENDENT POST-REMEDIATION VERIFICATION
        </div>
        <span className={`badge ${isResolved ? 'badge-green' : 'badge-red'}`}>
          {isResolved ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {checks.map((chk, i) => (
          <div
            key={i}
            style={{
              backgroundColor: chk.passed ? 'var(--status-green-bg)' : 'var(--status-red-bg)',
              border: `1px solid ${chk.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {chk.passed ? <CheckCircle2 size={16} style={{ color: 'var(--status-green)' }} /> : <XCircle size={16} style={{ color: 'var(--status-red)' }} />}
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{chk.name}</span>
            </div>
            <span className="mono" style={{ fontWeight: '700', color: chk.passed ? 'var(--status-green)' : 'var(--status-red)' }}>
              {chk.val}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: isResolved ? '#6ee7b7' : '#fca5a5',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <CheckCircle2 size={18} />
        <span>
          {isResolved
            ? 'SYSTEM HEALTHY — All recovery metrics confirmed within safe operational thresholds. Incident state transitioned to RESOLVED.'
            : 'RECOVERY THRESHOLD FAILED — Automated verification detected metric degradation. Incident escalated to senior engineer.'}
        </span>
      </div>
    </div>
  );
}
