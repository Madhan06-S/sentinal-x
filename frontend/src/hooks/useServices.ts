import { useQuery } from '@tanstack/react-query';
import { getServices } from '../api/services';
import { ServiceInfo } from '../types/service';

export const useServices = () => {
  return useQuery<ServiceInfo[]>({
    queryKey: ['services'],
    queryFn: getServices,
    refetchInterval: 5000,
  });
};
