import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../common/StatusBadge';
import SeverityBadge from '../common/SeverityBadge';
import EmptyState from '../common/EmptyState';
import { AlertOctagon, Search, ArrowRight, RefreshCw } from 'lucide-react';

export default function IncidentList() {
  const { incidents, setActiveIncidentId, refreshIncidents } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.root_cause?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusTab === 'ALL') return matchesSearch;
    if (statusTab === 'ACTIVE') return matchesSearch && inc.status !== 'RESOLVED' && inc.status !== 'FAILED';
    return matchesSearch && inc.status === statusTab;
  });

  return (
    <div className="panel">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="panel-title">
          <AlertOctagon size={16} /> Incidents Directory ({filteredIncidents.length} Records)
        </div>

        <div className="filter-bar">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '32px', width: '220px' }}
              placeholder="Search ID, title, cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0d1322', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
            {['ALL', 'ACTIVE', 'AWAITING_APPROVAL', 'RESOLVED'].map((tab) => (
              <button
                key={tab}
                className="btn"
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  backgroundColor: statusTab === tab ? 'var(--bg-card-hover)' : 'transparent',
                  color: statusTab === tab ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: 'none',
                }}
                onClick={() => setStatusTab(tab)}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={refreshIncidents}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <EmptyState
          title="No Incidents Found"
          description="No incident records match your selected status tab or search filter."
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Title / Description</th>
                <th>Severity</th>
                <th>Business Impact</th>
                <th>Probable Root Cause</th>
                <th>Recommended Action</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} onClick={() => setActiveIncidentId(inc.id)} style={{ cursor: 'pointer' }}>
                  <td className="mono" style={{ fontWeight: '700', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
                    {inc.id}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)', maxWidth: '280px' }}>
                    {inc.title}
                  </td>
                  <td>
                    <SeverityBadge severity={inc.severity} />
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                    {inc.business_impact || 'Evaluating...'}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                    {inc.root_cause || <span style={{ color: 'var(--text-muted)' }}>Under investigation</span>}
                  </td>
                  <td>
                    {inc.recommended_action ? (
                      <span className="badge badge-amber" style={{ fontSize: '10px' }}>{inc.recommended_action}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={inc.status} />
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      Open Workspace <ArrowRight size={12} />
                    </button>
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
