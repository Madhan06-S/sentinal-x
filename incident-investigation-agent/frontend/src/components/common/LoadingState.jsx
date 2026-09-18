import React from 'react';

export default function LoadingState({ message = 'Loading operational data...' }) {
  return (
    <div className="empty-state">
      <div className="loading-spinner" style={{ marginBottom: '16px', width: '32px', height: '32px' }} />
      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>{message}</div>
    </div>
  );
}
