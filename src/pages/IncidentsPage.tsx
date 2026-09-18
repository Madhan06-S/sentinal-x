import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { useIncidents } from '../hooks/useIncidents';
import { Flame } from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();

  return (
    <PageContainer
      title="Incidents Registry"
      description="Active & resolved enterprise operational incidents correlated by AI Engine"
    >
      <IncidentTable incidents={incidents} />
    </PageContainer>
  );
};
