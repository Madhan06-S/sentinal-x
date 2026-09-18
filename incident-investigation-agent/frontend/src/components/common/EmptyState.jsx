import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No Data Available', description = 'There are currently no items to display.', icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px' }}>
        {description}
      </p>
    </div>
  );
}
