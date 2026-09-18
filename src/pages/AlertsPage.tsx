import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { AlertTable } from '../components/alerts/AlertTable';
import { AlertDrawer } from '../components/alerts/AlertDrawer';
import { useAlerts } from '../hooks/useAlerts';
import { Alert } from '../types/alert';

export const AlertsPage: React.FC = () => {
  const { data: alerts, isLoading } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  return (
    <PageContainer
      title="Alert Management"
      description="Live telemetry alert stream, noise filtering, and correlation mapping"
    >
      <AlertTable alerts={alerts} onSelectAlert={(alt) => setSelectedAlert(alt)} />
      <AlertDrawer alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </PageContainer>
  );
};
