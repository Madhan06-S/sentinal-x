import { StructuredIncidentEvent } from '../types/incident';
import { engineFetch } from './client';

export interface SentinelXEvent {
  event_id: string;
  source: 'application';
  event_type: string;
  service: string;
  environment: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  timestamp: string;
  error_code?: string;
  message: string;
  metadata: Record<string, any>;
}

/**
 * Normalizes a severity string to SentinelX SeverityEnum
 */
function normalizeSeverity(severity: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' {
  const upper = (severity || 'INFO').toUpperCase();
  if (upper === 'WARNING') return 'HIGH';
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(upper)) {
    return upper as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  }
  return 'MEDIUM';
}

/**
 * Dispatches structured incident telemetry event to SentinelX Incident Engine at /api/v1/events.
 * If the engine is offline or times out (4s), returns gracefully without throwing.
 */
export async function sendEventToEngine(event: StructuredIncidentEvent): Promise<{
  delivered: boolean;
  data?: any;
  error?: string;
}> {
  // Generate unique event ID if missing
  const event_id = (event as any).event_id || `nexacart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Construct canonical SentinelX NormalizedEvent object
  const normalizedPayload: SentinelXEvent = {
    event_id,
    source: 'application',
    event_type: event.event_type || 'application_error',
    service: event.service || 'nexacart-frontend',
    environment: event.environment || 'development',
    severity: normalizeSeverity(event.severity),
    timestamp: event.timestamp || new Date().toISOString(),
    error_code: event.error_code || '',
    message: event.message || 'NexaCart operational failure',
    metadata: {
      app: 'NexaCart',
      ...(event.metadata || {}),
    },
  };

  const res = await engineFetch<any>('/api/v1/events', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  });

  return {
    delivered: res.success,
    data: res.data,
    error: res.error,
  };
}

