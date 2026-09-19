import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ServiceGrid } from '../components/services/ServiceGrid';
import { useServices } from '../hooks/useServices';

export const ServicesPage: React.FC = () => {
  const { data: services, isLoading } = useServices();

  return (
    <PageContainer
      title="Microservices Health Registry"
      description="Service topology status, error rates, p99 latency, and active deployment monitoring"
    >
      <ServiceGrid services={services} />
    </PageContainer>
  );
};
