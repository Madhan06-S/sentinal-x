import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { MetricCard } from '../components/dashboard/MetricCard';
import { CausalGraphCanvas, ServiceNodeState } from '../components/dashboard/CausalGraphCanvas';
import { IncidentVolumeChart } from '../components/dashboard/IncidentVolumeChart';
import { SeverityDistributionChart } from '../components/dashboard/SeverityDistributionChart';
import { LiveIncidentFeed } from '../components/dashboard/LiveIncidentFeed';
import { SystemHealthGrid } from '../components/dashboard/SystemHealthGrid';
import { AIReasoningStream, ReasoningEntry, initialReasoningEntries } from '../components/dashboard/AIReasoningStream';
import { TimeToggle } from '../components/ui/TimeToggle';
import { useIncidents, useApproveRemediation } from '../hooks/useIncidents';
import { useServices } from '../hooks/useServices';
import { Flame, AlertTriangle, Activity, Server, Cpu, Clock, Download } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

interface OverviewPageProps {
  autonomyLevel?: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ autonomyLevel = 3 }) => {
  const [timeRange, setTimeRange] = useState('Live 1h');
  const { data: incidents, isLoading: isLoadingIncidents } = useIncidents();
  const { data: services, isLoading: isLoadingServices } = useServices();
  const approveMutation = useApproveRemediation();

  // Graph service node states
  const [nodeStates, setNodeStates] = useState<Record<string, ServiceNodeState>>({
    'payment-api': 'critical',
    'payment-db': 'critical',
    'order-api': 'warning',
    'checkout-queue': 'warning',
    'auth-service': 'healthy',
    'user-db': 'healthy',
    'cache-redis': 'healthy',
    'notification-svc': 'healthy',
  });

  // Reasoning stream state
  const [reasoningList, setReasoningList] = useState<ReasoningEntry[]>(initialReasoningEntries);

  const activeCount = incidents?.filter((i) => i.status !== 'RESOLVED').length || 3;
  const criticalCount = incidents?.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length || 1;

  // Handle manual or automated incident approval -> triggers node heal green flash!
  const handleApproveIncident = (id: string) => {
    approveMutation.mutate(id);

    // Green flash animation on graph
    setNodeStates((prev) => ({
      ...prev,
      'payment-api': 'resolved',
      'payment-db': 'resolved',
      'order-api': 'healthy',
      'checkout-queue': 'healthy',
    }));

    // Add remediation complete reasoning entry
    setTimeout(() => {
      setReasoningList((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agentName: 'REMEDIATION AGENT',
          agentType: 'remediation',
          state: 'COMPLETE',
          text: 'Executed ROLLBACK_DEPLOYMENT to v2.4.0. Connection pool restored, error rate normalized to 0.01%.',
        },
      ]);
    }, 1200);

    setTimeout(() => {
      setNodeStates((prev) => ({
        ...prev,
        'payment-api': 'healthy',
        'payment-db': 'healthy',
      }));
    }, 3000);
  };

  if (isLoadingIncidents || isLoadingServices) {
    return (
      <PageContainer title="Aegis AI Command Center" description="Live autonomous AIOps telemetry & incident feed">
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
      description="Autonomous enterprise incident monitoring, causal graph topology & multi-agent reasoning stream"
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

          {/* Feature 1: Full-width CAUSAL GRAPH CANVAS between Stats and Charts */}
          <CausalGraphCanvas serviceStates={nodeStates} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <IncidentVolumeChart />
            </div>
            <div>
              <SeverityDistributionChart />
            </div>
          </div>

          {/* Live Incident Feed & AI Reasoning Stream Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LiveIncidentFeed
                incidents={incidents}
                autonomyLevel={autonomyLevel}
                onApproveIncident={handleApproveIncident}
              />
              <SystemHealthGrid services={services} />
            </div>
            <div>
              {/* Feature 2: Upgraded AI Reasoning Stream */}
              <AIReasoningStream entries={reasoningList} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </PageContainer>
  );
};
