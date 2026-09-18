import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { DeploymentTable } from '../components/deployments/DeploymentTable';
import { useDeployments } from '../hooks/useDeployments';

export const DeploymentsPage: React.FC = () => {
  const { data: deployments } = useDeployments();

  return (
    <PageContainer
      title="Deployments History"
      description="Recent git release deployments and suspected incident correlations"
    >
      <DeploymentTable deployments={deployments} />
    </PageContainer>
  );
};
