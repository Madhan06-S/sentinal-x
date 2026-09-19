import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { MetricCard } from '../components/dashboard/MetricCard';
import { IncidentVolumeChart } from '../components/dashboard/IncidentVolumeChart';
import { SeverityDistributionChart } from '../components/dashboard/SeverityDistributionChart';
import { LiveIncidentFeed } from '../components/dashboard/LiveIncidentFeed';
import { SystemHealthGrid } from '../components/dashboard/SystemHealthGrid';
import { AIActivityStream } from '../components/dashboard/AIActivityStream';
import { IncidentSlideOver } from '../components/incidents/IncidentSlideOver';
import { useIncidents } from '../hooks/useIncidents';
import { useServices } from '../hooks/useServices';
import { Incident } from '../types/incident';
import { Flame, AlertTriangle, Activity, Server, Cpu, Clock, Download, Filter } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export const OverviewPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Live 1h');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { data: incidents, isLoading: isLoadingIncidents } = useIncidents();
  const { data: services, isLoading: isLoadingServices } = useServices();

  const activeCount = incidents?.filter((i) => i.status !== 'RESOLVED').length || 2;
  const criticalCount = incidents?.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length || 1;

  if (isLoadingIncidents || isLoadingServices) {
    return (
      <PageContainer title="Aegis AI Command Center" description="Real-time autonomous incident resolution engine">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[10px]" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incidents || [], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "aegis_audit_report.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <PageContainer
      title="Aegis AI Command Center"
      description="Real-time autonomous enterprise incident monitoring, root cause detection, and remediation coordination"
      action={
        <div className="flex flex-col sm:flex-row items-center gap-3 font-sans">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E5E9F0] shadow-xs">
            {['Live 1h', '6h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportAudit}
            className="rounded-lg border border-[#E5E9F0] bg-white px-3.5 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export Audit Report
          </button>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* 6 Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Active Incidents"
              value={activeCount}
              change="+1 new"
              isNegativeTrend={true}
              variant="critical"
              icon={<Flame className="w-5 h-5 text-red-600" />}
            />
            <MetricCard
              title="Critical Signals"
              value={criticalCount}
              variant="critical"
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            />
            <MetricCard
              title="Alerts Rate"
              value="47/m"
              change="+12/m"
              isNegativeTrend={true}
              variant="default"
              icon={<Activity className="w-5 h-5 text-blue-600" />}
            />
            <MetricCard
              title="Services at Risk"
              value={2}
              variant="warning"
              icon={<Server className="w-5 h-5 text-amber-600" />}
            />
            <MetricCard
              title="Auto-Resolved"
              value={128}
              change="98.4%"
              isNegativeTrend={false}
              variant="healthy"
              icon={<Cpu className="w-5 h-5 text-emerald-600" />}
            />
            <MetricCard
              title="Avg MTTR"
              value="42s"
              variant="ai"
              icon={<Clock className="w-5 h-5 text-indigo-600" />}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <IncidentVolumeChart />
            </div>
            <div>
              <SeverityDistributionChart />
            </div>
          </div>

          {/* Live Incident Feed & Infrastructure Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LiveIncidentFeed incidents={incidents} onSelectIncident={(inc) => setSelectedIncident(inc)} />
              <SystemHealthGrid services={services} />
            </div>
            <div>
              <AIActivityStream />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Incident Detail Slide-over Panel */}
      {selectedIncident && (
        <IncidentSlideOver incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
      )}
    </PageContainer>
  );
};
