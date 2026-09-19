import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '../api/alerts';
import { Alert } from '../types/alert';

export const useAlerts = () => {
  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    refetchInterval: 4000,
  });
};
