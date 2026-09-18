import { useState, useEffect } from 'react';
import { incidentSimulator } from '../services/incidentSimulator';
import {
  SystemHealthStatus,
  SystemMetrics,
  StructuredIncidentEvent,
  IncidentTimelineStep,
  AllowedRemediationAction,
} from '../types/incident';

export function useIncidentSimulation() {
  const [status, setStatus] = useState<SystemHealthStatus>(incidentSimulator.getStatus());
  const [metrics, setMetrics] = useState<SystemMetrics>(incidentSimulator.getMetrics());
  const [events, setEvents] = useState<StructuredIncidentEvent[]>(incidentSimulator.getEvents());
  const [timeline, setTimeline] = useState<IncidentTimelineStep[]>(incidentSimulator.getTimeline());
  const [isSimulating, setIsSimulating] = useState<boolean>(incidentSimulator.getIsSimulating());
  const [backendStatus, setBackendStatus] = useState<'CONNECTED' | 'OFFLINE' | 'UNKNOWN'>(
    incidentSimulator.getBackendDeliveryStatus()
  );
  const [lastRemediation, setLastRemediation] = useState<string | null>(
    incidentSimulator.getLastRemediationAction()
  );
  const [isRemediating, setIsRemediating] = useState<boolean>(incidentSimulator.isRemediating());

  useEffect(() => {
    const unsubscribe = incidentSimulator.subscribe(() => {
      setStatus(incidentSimulator.getStatus());
      setMetrics(incidentSimulator.getMetrics());
      setEvents(incidentSimulator.getEvents());
      setTimeline(incidentSimulator.getTimeline());
      setIsSimulating(incidentSimulator.getIsSimulating());
      setBackendStatus(incidentSimulator.getBackendDeliveryStatus());
      setLastRemediation(incidentSimulator.getLastRemediationAction());
      setIsRemediating(incidentSimulator.isRemediating());
    });

    return unsubscribe;
  }, []);

  return {
    status,
    metrics,
    events,
    timeline,
    isSimulating,
    backendStatus,
    lastRemediation,
    isRemediating,
    startIncident: () => incidentSimulator.startIncident(),
    resetSimulation: () => incidentSimulator.resetSimulation(),
    executeRemediation: (action: AllowedRemediationAction) =>
      incidentSimulator.executeRemediation(action),
  };
}
