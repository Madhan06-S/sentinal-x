import { simulationEngine } from '../mocks/simulationEngine';
import { USE_MOCK_API } from '../api/client';

type EventCallback = (event: { type: string; payload: any }) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Set<EventCallback> = new Set();
  private reconnectTimer: any = null;
  private wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

  constructor() {
    if (USE_MOCK_API) {
      simulationEngine.subscribe((event) => {
        this.notify(event);
      });
    } else {
      this.connectWebSocket();
    }
  }

  private connectWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        console.log('[Realtime] WebSocket connected');
      };
      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notify(parsed);
        } catch (err) {
          console.error('[Realtime] Failed to parse WebSocket message:', err);
        }
      };
      this.ws.onclose = () => {
        console.warn('[Realtime] WebSocket closed. Retrying in 5 seconds...');
        this.reconnectTimer = setTimeout(() => this.connectWebSocket(), 5000);
      };
      this.ws.onerror = (err) => {
        console.error('[Realtime] WebSocket error:', err);
      };
    } catch (e) {
      console.error('[Realtime] Could not initiate WebSocket connection:', e);
    }
  }

  public subscribe(callback: EventCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(event: { type: string; payload: any }) {
    this.listeners.forEach((cb) => cb(event));
  }
}

export const realtimeService = new RealtimeService();
