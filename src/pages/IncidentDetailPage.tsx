import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { IncidentHeader } from '../components/incidents/IncidentHeader';
import { BlastRadiusView } from '../components/incidents/BlastRadiusView';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { RootCauseGraph } from '../components/incidents/RootCauseGraph';
import { AIInvestigationPanel } from '../components/incidents/AIInvestigationPanel';
import { BusinessImpactPanel } from '../components/incidents/BusinessImpactPanel';
import { AIDecisionPanel } from '../components/incidents/AIDecisionPanel';
import { RemediationPanel } from '../components/incidents/RemediationPanel';
import { TimeTravelScrubber, scrubberTicks } from '../components/incidents/TimeTravelScrubber';
import { ApprovalModal } from '../components/incidents/ApprovalModal';
import { useIncident, useRCAGraph } from '../hooks/useIncident';
import { useApproveRemediation, useRejectRemediation } from '../hooks/useIncidents';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const targetId = id || 'INC-1042';

  const { data: incident, isLoading, error, refetch } = useIncident(targetId);
  const { data: rcaGraph } = useRCAGraph(targetId);

  const approveMutation = useApproveRemediation();
  const rejectMutation = useRejectRemediation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrubberIdx, setScrubberIdx] = useState(3);

  if (isLoading) {
    return (
      <PageContainer title="Loading Incident Analysis...">
        <div className="space-y-6">
          <Skeleton className="h-44 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !incident) {
    return (
      <PageContainer title="Incident Not Found">
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-100">Unable to retrieve incident {targetId}</h3>
          <p className="text-xs text-zinc-400">
            Check that the backend or mock data engine is running and reachable.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/incidents')}>
              Back to Incidents
            </Button>
            <Button variant="primary" onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
              Retry Connection
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const currentScrubTick = scrubberTicks[scrubberIdx];
  const scrubbedStatus = currentScrubTick ? (currentScrubTick.incidentStatus as any) : incident.status;

  const handleApproveConfirm = async () => {
    try {
      await approveMutation.mutateAsync(targetId);
      setIsModalOpen(false);
    } catch (e) {
      console.error('Failed to approve remediation:', e);
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({ incidentId: targetId, reason: 'Rejected by engineer' });
    } catch (e) {
      console.error('Failed to reject remediation:', e);
    }
  };

  return (
    <PageContainer
      title={`AI Investigation: ${incident.incident_id}`}
      description="Hero Command View — Causal Root Cause Graph, Concentric Blast Radius, AI Evidence & Time-Travel Scrubber"
      action={
        <Button variant="outline" size="sm" onClick={() => navigate('/incidents')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Incidents
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 1. Header Banner */}
        <IncidentHeader incident={{ ...incident, status: scrubbedStatus }} />

        {/* 2. Concentric Blast Radius View */}
        <BlastRadiusView
          rootCauseService="payment-service"
          ring1Count={4}
          ring2Count={2}
          ring3Count={3}
        />

        {/* 3. Interactive RCA Causal Graph */}
        <RootCauseGraph graphData={rcaGraph} />

        {/* 4. AI Decision & Human Approval */}
        {(scrubbedStatus === 'AWAITING_APPROVAL' || scrubbedStatus === 'OPEN') && (
          <AIDecisionPanel
            decision={incident.ai_decision}
            onApprove={() => setIsModalOpen(true)}
            onReject={handleReject}
            isPending={approveMutation.isPending || rejectMutation.isPending}
          />
        )}

        {/* 5. Active Remediation Progress Panel */}
        {(scrubbedStatus === 'REMEDIATING' || scrubbedStatus === 'VERIFYING' || scrubbedStatus === 'RESOLVED') && (
          <RemediationPanel remediation={incident.remediation} />
        )}

        {/* 6. AI Investigation Reasoning & Business Impact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInvestigationPanel investigation={incident.ai_investigation} />
          <BusinessImpactPanel impact={incident.business_impact_details} />
        </div>

        {/* 7. Chronological Incident Timeline */}
        <IncidentTimeline events={incident.timeline} />

        {/* 8. Feature 6: Time-Travel Scrubber */}
        <TimeTravelScrubber
          currentIndex={scrubberIdx}
          onScrub={(idx) => setScrubberIdx(idx)}
        />

        {/* Approval Modal */}
        <ApprovalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleApproveConfirm}
          incident={incident}
          isSubmitting={approveMutation.isPending}
        />
      </div>
    </PageContainer>
  );
};
