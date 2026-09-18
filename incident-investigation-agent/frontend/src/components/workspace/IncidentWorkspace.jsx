import React from 'react';
import { useApp } from '../../context/AppContext';
import IncidentHeader from './IncidentHeader';
import LifecycleTimeline from './LifecycleTimeline';
import CorrelatedSignals from './CorrelatedSignals';
import RAGKnowledgeCard from './RAGKnowledgeCard';
import GitHubEvidenceCard from './GitHubEvidenceCard';
import HypothesesList from './HypothesesList';
import RootCauseCard from './RootCauseCard';
import ConfidenceMeter from './ConfidenceMeter';
import BusinessImpactCard from './BusinessImpactCard';
import DecisionPanel from './DecisionPanel';
import HumanApprovalCard from './HumanApprovalCard';
import RemediationCompare from './RemediationCompare';
import VerificationCard from './VerificationCard';
import IncidentAuditTrail from './IncidentAuditTrail';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import { AlertOctagon } from 'lucide-react';

export default function IncidentWorkspace() {
  const { activeIncident, loading } = useApp();

  if (loading.activeIncident && !activeIncident) {
    return <LoadingState message="Loading incident investigation command center..." />;
  }

  if (!activeIncident) {
    return (
      <EmptyState
        title="No Active Incident Selected"
        description="Select an incident from the directory or trigger a demo scenario to view the investigation workspace."
        icon={AlertOctagon}
      />
    );
  }

  const alerts = activeIncident.alerts || [];
  const analyses = activeIncident.analyses || [];
  const timeline = activeIncident.timeline || [];
  const rootCauseEvidence = activeIncident.root_cause_evidence || {};

  // Extract hypotheses from analyses or root cause evidence
  const hypotheses =
    analyses.length > 0
      ? analyses[analyses.length - 1].hypotheses || []
      : activeIncident.analysis_summary
      ? activeIncident.analysis_summary.split('\n')
      : [];

  const reason =
    analyses.length > 0
      ? analyses[analyses.length - 1].reason
      : activeIncident.decision_reason || rootCauseEvidence.reasoning;

  const hasDeployments = alerts.some(
    (a) => a.alert_type === 'deployment' || (a.message || '').toLowerCase().includes('deploy')
  );
  const hasRag = analyses.some((a) => a.evidence && a.evidence.length > 0);
  const hasErrorCode = alerts.some((a) => a.error_code);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Incident Title Header & Action Bar */}
      <IncidentHeader incident={activeIncident} />

      {/* Lifecycle Stepper Timeline */}
      <LifecycleTimeline status={activeIncident.status} />

      {/* Human Approval Card (Prominent when AWAITING_APPROVAL) */}
      <HumanApprovalCard incident={activeIncident} />

      {/* Primary Investigation Command Center 2-Column Grid */}
      <div className="workspace-grid">
        {/* Left Column: Telemetry & Retrieved Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Correlated Operational Events */}
          <CorrelatedSignals alerts={alerts} />

          {/* RAG Knowledge Document Evidence */}
          <RAGKnowledgeCard analyses={analyses} />

          {/* GitHub Commit & Development Telemetry */}
          <GitHubEvidenceCard incident={activeIncident} />

          {/* Incident Audit Trail */}
          <IncidentAuditTrail timeline={timeline} />
        </div>

        {/* Right Column: AI Reasoning, Root Cause, Remediation & Verification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Prominent Probable Root Cause (or INSUFFICIENT EVIDENCE) */}
          <RootCauseCard
            rootCause={activeIncident.root_cause}
            reason={reason}
            confidence={activeIncident.confidence}
          />

          {/* Structured Hypotheses & Evidence */}
          <HypothesesList hypotheses={hypotheses} evidence={rootCauseEvidence} />

          {/* Confidence Score & Evidence Grounding Breakdown */}
          <ConfidenceMeter
            confidence={activeIncident.confidence}
            hasDeployments={hasDeployments}
            hasRag={hasRag}
            hasErrorCode={hasErrorCode}
          />

          {/* Business Impact Card */}
          <BusinessImpactCard
            impact={activeIncident.business_impact}
            service={alerts.length > 0 ? alerts[0].service : 'payment-service'}
          />

          {/* Layer 2 Policy Engine Recommended Action */}
          <DecisionPanel
            action={activeIncident.recommended_action}
            riskLevel={activeIncident.risk_level}
            approvalRequired={activeIncident.approval_required}
            reason={reason}
          />

          {/* Simulated Remediation BEFORE vs AFTER Transition */}
          <RemediationCompare incident={activeIncident} />

          {/* Independent Verification Threshold Results */}
          <VerificationCard incident={activeIncident} />
        </div>
      </div>
    </div>
  );
}
