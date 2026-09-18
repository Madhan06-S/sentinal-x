import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeService } from '../services/realtime';

export const useRealtime = (onEvent?: (event: { type: string; payload: any }) => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((event) => {
      // Invalidate relevant query caches upon receiving real-time events
      if (event.type.includes('INCIDENT')) {
        queryClient.invalidateQueries({ queryKey: ['incidents'] });
        if (event.payload?.incident_id) {
          queryClient.invalidateQueries({ queryKey: ['incident', event.payload.incident_id] });
        }
      }
      if (event.type.includes('ALERT')) {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
      }
      if (event.type.includes('SERVICES')) {
        queryClient.invalidateQueries({ queryKey: ['services'] });
      }
      if (event.type.includes('AUDIT')) {
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      }

      if (onEvent) {
        onEvent(event);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, onEvent]);
};
