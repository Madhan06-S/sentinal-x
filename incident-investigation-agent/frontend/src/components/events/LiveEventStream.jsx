import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SeverityBadge from '../common/SeverityBadge';
import EmptyState from '../common/EmptyState';
import { Radio, Search, Filter, RefreshCw } from 'lucide-react';

export default function LiveEventStream() {
  const { alerts, refreshAlerts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const services = Array.from(new Set(alerts.map((a) => a.service).filter(Boolean)));
  const statuses = Array.from(new Set(alerts.map((a) => a.status).filter(Boolean)));

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.error_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.source?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = selectedService === 'ALL' || a.service === selectedService;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;

    return matchesSearch && matchesService && matchesStatus;
  });

  return (
    <div className="panel">
      {/* Panel Header & Filtering Toolbar */}
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="panel-title">
          <Radio size={16} /> Live Ingested Telemetry Console ({filteredAlerts.length} Signals)
        </div>

        <div className="filter-bar">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '32px', width: '220px' }}
              placeholder="Search message, code, source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="select-input"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="ALL">All Services</option>
              {services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <select
            className="select-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Pipeline Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={refreshAlerts} title="Refresh Events">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Events Table */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="No telemetry signals match the current search filter criteria or none have been ingested yet."
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source</th>
                <th>Service</th>
                <th>Event / Type</th>
                <th>Severity</th>
                <th>Error Code</th>
                <th>Message</th>
                <th>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((evt) => (
                <tr key={evt.id}>
                  <td className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: '500' }}>{evt.source}</td>
                  <td className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>
                    {evt.service}
                  </td>
                  <td>{evt.alert_type}</td>
                  <td>
                    <SeverityBadge severity={evt.severity} />
                  </td>
                  <td className="mono">
                    {evt.error_code ? (
                      <span className="badge badge-amber" style={{ fontSize: '10px' }}>{evt.error_code}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: '500', maxWidth: '350px' }}>
                    {evt.message}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        evt.status === 'CORRELATED'
                          ? 'badge-green'
                          : evt.status === 'FILTERED'
                          ? 'badge-cyan'
                          : evt.status === 'IGNORED'
                          ? 'badge-amber'
                          : 'badge-open'
                      }`}
                    >
                      {evt.status}
                    </span>
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
