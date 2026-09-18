import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div 
      style={{
        backgroundColor: 'var(--status-red-bg)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        color: '#fca5a5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        fontWeight: '500',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertTriangle size={18} style={{ color: 'var(--status-red)', flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '4px' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
