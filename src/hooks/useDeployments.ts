import { useQuery } from '@tanstack/react-query';
import { getDeployments } from '../api/deployments';
import { Deployment } from '../types/deployment';

export const useDeployments = () => {
  return useQuery<Deployment[]>({
    queryKey: ['deployments'],
    queryFn: getDeployments,
  });
};
