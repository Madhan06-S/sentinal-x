import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function HypothesesList({ hypotheses = [], evidence = {} }) {
  const supporting = evidence.supporting_evidence || [];
  const contradicting = evidence.contradicting_evidence || [];
  const missing = evidence.missing_evidence || [];

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Cpu size={16} /> Structured AI Hypotheses &amp; Reasoning
        </div>
      </div>

      {hypotheses.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
          No hypotheses generated yet. Click "Run Groq &amp; RAG Investigation" to formulate root cause hypotheses.
        </div>
      ) : (
        <div>
          {hypotheses.map((hyp, i) => {
            const hypText = typeof hyp === 'string' ? hyp : hyp.statement || hyp.cause || JSON.stringify(hyp);

            return (
              <div key={i} className="hypothesis-card">
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {hypText.startsWith('H') ? hypText : `H${i + 1}: ${hypText}`}
                </div>

                <ul className="evidence-list">
                  {supporting.length > 0 &&
                    supporting.map((ev, k) => (
                      <li key={k} className="evidence-item" style={{ color: '#86efac' }}>
                        <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                        <span>Supporting: {ev}</span>
                      </li>
                    ))}

                  {contradicting.length > 0 &&
                    contradicting.map((ev, k) => (
                      <li key={k} className="evidence-item" style={{ color: '#fca5a5' }}>
                        <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                        <span>Contradicting: {ev}</span>
                      </li>
                    ))}

                  {missing.length > 0 &&
                    missing.map((ev, k) => (
                      <li key={k} className="evidence-item" style={{ color: '#fdba74' }}>
                        <HelpCircle size={14} style={{ flexShrink: 0 }} />
                        <span>Missing Signal: {ev}</span>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
