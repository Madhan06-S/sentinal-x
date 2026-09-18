import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmptyState from '../common/EmptyState';
import { History, Search, RefreshCw, FileText } from 'lucide-react';

export default function AuditTrailView() {
  const { auditLogs, refreshAuditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const text = JSON.stringify(log).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="panel">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="panel-title">
          <History size={16} /> Immutable System Audit Log ({filteredLogs.length} Records)
        </div>

        <div className="filter-bar">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '32px', width: '250px' }}
              placeholder="Search audit log entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn btn-secondary" onClick={refreshAuditLogs}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No Audit Logs"
          description="No system audit log entries match your search criteria."
          icon={FileText}
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Incident ID</th>
                <th>Event / Action Type</th>
                <th>Execution Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>
                    {log.incident_id || 'SYSTEM'}
                  </td>
                  <td>
                    <span className="badge badge-amber" style={{ fontSize: '10px' }}>
                      {log.event_type}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '500px', wordBreak: 'break-word' }}>
                    {log.details ? JSON.stringify(log.details) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
