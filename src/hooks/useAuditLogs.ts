import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../api/audit';
import { AuditEntry } from '../types/audit';

export const useAuditLogs = () => {
  return useQuery<AuditEntry[]>({
    queryKey: ['auditLogs'],
    queryFn: getAuditLogs,
    refetchInterval: 5000,
  });
};
