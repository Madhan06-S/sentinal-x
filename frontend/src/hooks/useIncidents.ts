import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIncidents, approveRemediation, rejectRemediation, getRCAGraph, getBlastRadius } from '../api/incidents';
import { Incident } from '../types/incident';
import { RCAGraphData, BlastRadiusData } from '../types/rca';

export const useIncidents = () => {
  return useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: getIncidents,
    refetchInterval: 5000,
  });
};

export const useRCAGraph = (incidentId?: string) => {
  return useQuery<RCAGraphData>({
    queryKey: ['rcaGraph', incidentId],
    queryFn: () => getRCAGraph(incidentId || 'INC-1042'),
    enabled: !!incidentId,
  });
};

export const useBlastRadius = (incidentId?: string) => {
  return useQuery<BlastRadiusData>({
    queryKey: ['blastRadius', incidentId],
    queryFn: () => getBlastRadius(incidentId || 'INC-1042'),
    enabled: !!incidentId,
  });
};

export const useApproveRemediation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => approveRemediation(incidentId),
    onSuccess: (updatedIncident) => {
      queryClient.setQueryData(['incident', updatedIncident.incident_id], updatedIncident);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['systemHealth'] });
    },
  });
};

export const useRejectRemediation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, reason }: { incidentId: string; reason?: string }) =>
      rejectRemediation(incidentId, reason),
    onSuccess: (updatedIncident) => {
      queryClient.setQueryData(['incident', updatedIncident.incident_id], updatedIncident);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};

