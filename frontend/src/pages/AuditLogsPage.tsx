import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { AuditTable } from '../components/audit/AuditTable';
import { useAuditLogs } from '../hooks/useAuditLogs';

export const AuditLogsPage: React.FC = () => {
  const { data: auditLogs } = useAuditLogs();

  return (
    <PageContainer
      title="System & AI Audit Log Trail"
      description="Immutable audit trail of AI reasoning decisions, human approvals, and remediation actions"
    >
      <AuditTable auditLogs={auditLogs} />
    </PageContainer>
  );
};
