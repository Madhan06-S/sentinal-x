/**
 * Centralized API client for communicating with the Autonomous Incident Engine Backend.
 * Strictly uses VITE_INCIDENT_ENGINE_URL with resilient error handling.
 */

const ENGINE_BASE_URL = (import.meta.env.VITE_INCIDENT_ENGINE_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export async function engineFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 4000
): Promise<ApiResponse<T>> {
  const url = `${ENGINE_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorText = errorJson.message || errorJson.error || errorText;
      } catch {
        // use default errorText
      }
      return {
        success: false,
        error: errorText,
        statusCode: response.status,
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      success: true,
      data,
      statusCode: response.status,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isAbort = err.name === 'AbortError';
    return {
      success: false,
      error: isAbort ? 'Incident Engine connection timed out' : 'Incident Engine is offline or unreachable',
      statusCode: 0,
    };
  }
}

export function getIncidentEngineUrl(): string {
  return ENGINE_BASE_URL;
}
