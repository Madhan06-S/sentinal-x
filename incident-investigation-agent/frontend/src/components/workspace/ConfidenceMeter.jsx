import React from 'react';
import { Gauge } from 'lucide-react';

export default function ConfidenceMeter({ confidence = 0.5, hasDeployments, hasRag, hasErrorCode }) {
  const pct = Math.round((confidence || 0) * 100);

  let barColor = 'var(--accent-cyan)';
  let label = 'Moderate Evidence';

  if (pct >= 80) {
    barColor = 'var(--status-green)';
    label = 'Strong Deterministic Evidence';
  } else if (pct >= 50) {
    barColor = 'var(--status-amber)';
    label = 'Moderate Evidence Grounding';
  } else {
    barColor = 'var(--status-red)';
    label = 'Low Confidence / Insufficient Evidence';
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Gauge size={16} /> Confidence Breakdown &amp; Evidence Grounding
        </div>
        <span style={{ fontSize: '16px', fontWeight: '800', color: barColor }}>
          {pct}%
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>{label}</span>
          <span>{pct}/100</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Breakdown Breakdown Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>RAG Knowledge Base Match:</span>
          <span className="mono" style={{ color: hasRag ? 'var(--status-green)' : 'var(--text-muted)' }}>
            {hasRag ? '+10% Verified' : 'None Detected'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Git / Deployment Activity:</span>
          <span className="mono" style={{ color: hasDeployments ? 'var(--status-green)' : 'var(--text-muted)' }}>
            {hasDeployments ? '+15% Verified' : 'None Detected'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Error Code Signature:</span>
          <span className="mono" style={{ color: hasErrorCode ? 'var(--status-green)' : 'var(--text-muted)' }}>
            {hasErrorCode ? '+5% Verified' : 'None Detected'}
          </span>
        </div>
      </div>
    </div>
  );
}
