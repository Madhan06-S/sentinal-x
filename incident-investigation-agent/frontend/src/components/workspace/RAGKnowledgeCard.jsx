import React from 'react';
import { BookOpen, FileCode } from 'lucide-react';

export default function RAGKnowledgeCard({ analyses = [] }) {
  // Extract RAG evidence from analyses if available
  const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null;
  const rawResponse = latestAnalysis?.raw_response || {};
  const evidenceList = latestAnalysis?.evidence || rawResponse.evidence || [];

  return (
    <div className="panel" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
      <div className="panel-header">
        <div className="panel-title" style={{ color: 'var(--accent-blue)' }}>
          <BookOpen size={16} /> Retrieved RAG Knowledge Base Evidence
        </div>
        <span className="badge badge-open">RETRIEVED KNOWLEDGE</span>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Operational vector/hybrid search retrieved matching historical incident patterns &amp; troubleshooting documents:
      </div>

      {evidenceList.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
          No matching historical RAG knowledge documents retrieved for this incident error signature.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {evidenceList.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', fontWeight: '600', marginBottom: '4px' }}>
                <FileCode size={14} />
                <span>Evidence #{idx + 1}: {typeof item === 'string' ? item : item.title || JSON.stringify(item)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
