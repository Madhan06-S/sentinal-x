import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { MetricCard } from '../components/dashboard/MetricCard';
import { IncidentVolumeChart } from '../components/dashboard/IncidentVolumeChart';
import { SeverityDistributionChart } from '../components/dashboard/SeverityDistributionChart';
import { LiveIncidentFeed } from '../components/dashboard/LiveIncidentFeed';
import { SystemHealthGrid } from '../components/dashboard/SystemHealthGrid';
import { AIActivityStream } from '../components/dashboard/AIActivityStream';
import { TimeToggle } from '../components/ui/TimeToggle';
import { useIncidents } from '../hooks/useIncidents';
import { useServices } from '../hooks/useServices';
import { Flame, AlertTriangle, Activity, Server, Cpu, Clock, Download } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export const OverviewPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Live 1h');
  const { data: incidents, isLoading: isLoadingIncidents } = useIncidents();
  const { data: services, isLoading: isLoadingServices } = useServices();

  const activeCount = incidents?.filter((i) => i.status !== 'RESOLVED').length || 3;
  const criticalCount = incidents?.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length || 1;

  if (isLoadingIncidents || isLoadingServices) {
    return (
      <PageContainer title="Command Center Overview" description="Live autonomous AIOps telemetry & incident feed">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Aegis AI Command Center"
      description="Real-time autonomous enterprise incident monitoring, root cause detection, and remediation coordination"
      action={
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <TimeToggle active={timeRange} onChange={setTimeRange} />
          <button className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5 text-zinc-400" /> Export Audit Report
          </button>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, scale: 0.99, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.99, y: -6 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Active Incidents"
              value={activeCount}
              change="+1 new"
              isNegativeTrend={true}
              variant="critical"
              icon={<Flame className="w-5 h-5" />}
            />
            <MetricCard
              title="Critical"
              value={criticalCount}
              variant="critical"
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            <MetricCard
              title="Alerts / min"
              value={47}
              change="+12/m"
              isNegativeTrend={true}
              icon={<Activity className="w-5 h-5" />}
            />
            <MetricCard
              title="Services at Risk"
              value={2}
              variant="warning"
              icon={<Server className="w-5 h-5" />}
            />
            <MetricCard
              title="Auto-Resolved"
              value={128}
              change="98.4%"
              isNegativeTrend={false}
              variant="healthy"
              icon={<Cpu className="w-5 h-5" />}
            />
            <MetricCard
              title="Avg Resolution"
              value="42s"
              variant="ai"
              icon={<Clock className="w-5 h-5" />}
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
              <LiveIncidentFeed incidents={incidents} />
              <SystemHealthGrid services={services} />
            </div>
            <div>
              <AIActivityStream />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageContainer>
  );
};
