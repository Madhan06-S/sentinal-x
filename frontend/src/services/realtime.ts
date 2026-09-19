import { simulationEngine } from '../mocks/simulationEngine';
import { USE_MOCK_API, BASE_URL } from '../api/client';

type EventCallback = (event: { type: string; payload: any }) => void;
export type ConnectionStatus = 'LIVE' | 'RECONNECTING' | 'OFFLINE';
type StatusCallback = (status: ConnectionStatus) => void;

const PRODUCTION_BACKEND_HOST = 'sentinel-x-nqm6.onrender.com';

export const getWebSocketUrl = (): string => {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && envWs.trim()) {
    let rawWs = envWs.trim();
    // Fix: If VITE_WS_URL incorrectly targets frontend host or localhost in production
    if (
      rawWs.includes('sentinel-x-1.onrender.com') ||
      rawWs.includes('localhost') ||
      rawWs.includes('127.0.0.1')
    ) {
      rawWs = rawWs
        .replace('sentinel-x-1.onrender.com', PRODUCTION_BACKEND_HOST)
        .replace('ws://localhost:8000', `wss://${PRODUCTION_BACKEND_HOST}`)
        .replace('ws://127.0.0.1:8000', `wss://${PRODUCTION_BACKEND_HOST}`);
    }
    if (rawWs.startsWith('wss://') || rawWs.startsWith('ws://')) {
      return rawWs;
    }
  }

  // Derive WebSocket URL directly from REST BASE_URL (which targets https://sentinel-x-nqm6.onrender.com/api/v1)
  let wsUrl = BASE_URL.trim();

  if (wsUrl.startsWith('https://')) {
    wsUrl = wsUrl.replace('https://', 'wss://');
  } else if (wsUrl.startsWith('http://')) {
    wsUrl = wsUrl.replace('http://', 'ws://');
  } else if (!wsUrl.startsWith('wss://') && !wsUrl.startsWith('ws://')) {
    wsUrl = `wss://${wsUrl}`;
  }

  if (wsUrl.endsWith('/')) {
    wsUrl = wsUrl.slice(0, -1);
  }

  if (wsUrl.endsWith('/api/v1')) {
    wsUrl = `${wsUrl}/ws`;
  } else if (!wsUrl.endsWith('/api/v1/ws') && !wsUrl.endsWith('/ws')) {
    wsUrl = `${wsUrl}/api/v1/ws`;
  }

  return wsUrl;
};

class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Set<EventCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private reconnectDelay = 1000;
  private maxReconnectDelay = 15000;
  private reconnectTimer: any = null;
  public status: ConnectionStatus = 'OFFLINE';

  constructor() {
    if (USE_MOCK_API) {
      this.status = 'LIVE';
      simulationEngine.subscribe((event) => {
        this.notify(event);
      });
    } else {
      this.connectWebSocket();
    }
  }

  public get isConnected(): boolean {
    return this.status === 'LIVE';
  }

  private setStatus(newStatus: ConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((fn) => fn(newStatus));
    }
  }

  public subscribeStatus(callback: StatusCallback) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private connectWebSocket() {
    const wsUrl = getWebSocketUrl();
    try {
      this.setStatus('RECONNECTING');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectDelay = 1000;
        this.setStatus('LIVE');
        this.notify({ type: 'WS_CONNECTED', payload: {} });
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notify(parsed);
        } catch (err) {
          // ignore
        }
      };

      this.ws.onclose = () => {
        this.handleDisconnect();
      };

      this.ws.onerror = () => {
        this.handleDisconnect();
      };
    } catch (e) {
      this.handleDisconnect();
    }
  }

  private handleDisconnect() {
    if (this.status !== 'OFFLINE') {
      this.setStatus('RECONNECTING');
    }
    this.notify({ type: 'WS_DISCONNECTED', payload: {} });

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.connectWebSocket();
    }, this.reconnectDelay);
  }

  public subscribe(callback: EventCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public emit(event: { type: string; payload: any }) {
    this.notify(event);
  }

  private notify(event: { type: string; payload: any }) {
    this.listeners.forEach((cb) => cb(event));
  }
}

export const realtimeService = new RealtimeService();
