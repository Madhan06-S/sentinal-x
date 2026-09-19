import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { FiltersBar } from '../components/ui/FiltersBar';
import { DataTable, Column } from '../components/ui/DataTable';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { IncidentSlideOver } from '../components/incidents/IncidentSlideOver';
import { useIncidents } from '../hooks/useIncidents';
import { Incident } from '../types/incident';
import { AlertSeverity } from '../types/alert';
import { Skeleton } from '../components/ui/Skeleton';

export const IncidentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data: incidents, isLoading } = useIncidents();

  const handleSeverityToggle = (sev: AlertSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  const handleStatusToggle = (st: string) => {
    setSelectedStatus((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const filteredData = (incidents || []).filter((inc) => {
    const matchesSearch =
      !searchQuery ||
      inc.incident_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.root_cause || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      selectedSeverities.length === 0 || selectedSeverities.includes(inc.severity);

    const matchesStatus =
      selectedStatus.length === 0 || selectedStatus.includes(inc.status);

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const columns: Column<Incident>[] = [
    {
      key: 'incident_id',
      header: 'Incident ID',
      mono: true,
      render: (row) => (
        <span className="text-blue-600 font-bold hover:underline cursor-pointer">
          {row.incident_id}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Title & Summary',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 leading-snug">{row.title}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Service: {row.affected_services?.[0] || 'payment-service'}
          </div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => <SeverityBadge severity={row.severity} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'root_cause',
      header: 'Root Cause Hypothesis',
      render: (row) => (
        <div className="max-w-xs truncate text-slate-600 font-sans" title={row.root_cause || 'Analyzing telemetry...'}>
          {row.root_cause || 'Analyzing operational telemetry...'}
        </div>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      mono: true,
      render: (row) => (
        <span className="font-bold text-slate-900">{row.confidence ? `${row.confidence}%` : '94%'}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      mono: true,
      render: (row) => new Date(row.created_at).toLocaleTimeString(),
    },
  ];

  if (isLoading) {
    return (
      <PageContainer title="Incidents Management" description="Autonomous enterprise incident detection and resolution tracking">
        <Skeleton className="h-64 rounded-[10px]" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Incidents Management"
      description="Active, investigating, and resolved autonomous AIOps incident workspace"
    >
      <FiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSeverities={selectedSeverities}
        onSeverityToggle={handleSeverityToggle}
        selectedStatus={selectedStatus}
        onStatusToggle={handleStatusToggle}
        statusOptions={['OPEN', 'INVESTIGATING', 'AWAITING_APPROVAL', 'REMEDIATING', 'RESOLVED']}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        onRowClick={(row) => setSelectedIncident(row)}
        pageSize={10}
        emptyTitle="No incidents found"
        emptySubtext="No incidents match the active filter criteria."
      />

      {/* Slide-over Detail View */}
      {selectedIncident && (
        <IncidentSlideOver incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
      )}
    </PageContainer>
  );
};
