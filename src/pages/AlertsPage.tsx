import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { FiltersBar } from '../components/ui/FiltersBar';
import { DataTable, Column } from '../components/ui/DataTable';
import { SeverityBadge, Badge } from '../components/ui/Badge';
import { useAlerts } from '../hooks/useAlerts';
import { Alert, AlertSeverity } from '../types/alert';
import { Skeleton } from '../components/ui/Skeleton';
import { ChevronDown, ChevronRight, SlidersHorizontal, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export const AlertsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([]);
  const [hideSuppressed, setHideSuppressed] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const { data: alerts, isLoading } = useAlerts();

  const handleSeverityToggle = (sev: AlertSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  const filteredAlerts = (alerts || []).filter((alt) => {
    const matchesSearch =
      !searchQuery ||
      alt.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      selectedSeverities.length === 0 || selectedSeverities.includes(alt.severity);

    const matchesSuppressed = !hideSuppressed || alt.status !== 'SILENCED';

    return matchesSearch && matchesSeverity && matchesSuppressed;
  });

  const columns: Column<Alert>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      mono: true,
      render: (row) => new Date(row.timestamp).toLocaleTimeString(),
    },
    {
      key: 'service',
      header: 'Service',
      mono: true,
      render: (row) => <span className="font-bold text-blue-600">{row.service}</span>,
    },
    {
      key: 'source',
      header: 'Rule / Source',
      render: (row) => <span className="text-slate-600 font-mono text-[12px]">{row.source}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => <SeverityBadge severity={row.severity} size="sm" />,
    },
    {
      key: 'message',
      header: 'Alert Message',
      render: (row) => (
        <div className="max-w-md truncate font-sans text-slate-800" title={row.message}>
          {row.message.length > 80 ? `${row.message.substring(0, 80)}...` : row.message}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'SILENCED' ? 'neutral' : row.status === 'CORRELATED' ? 'ai' : 'info'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'incident_id',
      header: 'Linked Incident',
      mono: true,
      render: (row) =>
        row.incident_id ? (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
            {row.incident_id}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'expand',
      header: '',
      render: (row) => (
        <div className="text-slate-400 hover:text-slate-700">
          {expandedAlertId === row.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <PageContainer title="Telemetry Alerts" description="Real-time ingested operational alert stream">
        <Skeleton className="h-64 rounded-[10px]" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Telemetry & Noise Filtering Stream"
      description="Normalized alert logs, deduplication engine, and correlation pipeline"
    >
      <FiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSeverities={selectedSeverities}
        onSeverityToggle={handleSeverityToggle}
        extraControls={
          <button
            onClick={() => setHideSuppressed(!hideSuppressed)}
            className={cn(
              'px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-all font-sans flex items-center gap-1.5 cursor-pointer',
              hideSuppressed
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                : 'bg-white border-[#E5E9F0] text-slate-700 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{hideSuppressed ? 'Showing Active Only' : 'Hide Suppressed Noise'}</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={filteredAlerts}
        onRowClick={(row) => setExpandedAlertId(expandedAlertId === row.id ? null : row.id)}
        pageSize={12}
        isRowExpanded={(row) => expandedAlertId === row.id}
        renderExpandedRow={(row) => (
          <div className="p-4 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg space-y-3 font-mono text-[12px]">
            <div className="flex items-center justify-between text-slate-700 border-b border-[#E5E9F0] pb-2">
              <span className="font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> RAW ALERT PAYLOAD DATA ({row.id})
              </span>
              {row.incident_id && (
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">
                  Incident Link: {row.incident_id}
                </span>
              )}
            </div>
            <pre className="p-3 bg-white border border-[#E5E9F0] rounded-lg text-slate-900 overflow-x-auto text-[11px] leading-relaxed">
              {JSON.stringify(row, null, 2)}
            </pre>
          </div>
        )}
        emptyTitle="No telemetry alerts found"
        emptySubtext="No alerts match the active search or noise suppression filters."
      />
    </PageContainer>
  );
};
