import { useQuery } from '@tanstack/react-query';
import { getIncidentById, getRCAGraph } from '../api/incidents';
import { Incident } from '../types/incident';
import { RCAGraphData } from '../types/rca';

export const useIncident = (id?: string) => {
  return useQuery<Incident>({
    queryKey: ['incident', id],
    queryFn: () => getIncidentById(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });
};

export const useRCAGraph = (incidentId?: string) => {
  return useQuery<RCAGraphData>({
    queryKey: ['rcaGraph', incidentId],
    queryFn: () => getRCAGraph(incidentId!),
    enabled: !!incidentId,
  });
};
