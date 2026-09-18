import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { VerdictCard } from '../components/audit/VerdictCard';
import { AuditTable } from '../components/audit/AuditTable';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useNavigate } from 'react-router-dom';

export const AuditLogsPage: React.FC = () => {
  const { data: auditLogs } = useAuditLogs();
  const navigate = useNavigate();

  const handleReplayIncident = (incidentId: string) => {
    navigate(`/incidents/${incidentId}`);
  };

  return (
    <PageContainer
      title="System & AI Audit Log Trail"
      description="Immutable case-file verdict cards, AI reasoning decisions, human approvals, and remediation outcome reports"
    >
      <div className="space-y-8">
        {/* Feature 7: Verdict Cards */}
        <VerdictCard onReplayIncident={handleReplayIncident} />

        {/* Detailed Audit Table */}
        <AuditTable auditLogs={auditLogs} />
      </div>
    </PageContainer>
  );
};
