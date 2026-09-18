/**
 * Real-time WebSocket connection manager for backend signals
 */

export class RealtimeClient {
  constructor(onMessageCallback, onStatusChange) {
    this.onMessage = onMessageCallback;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.reconnectTimer = null;
    this.connected = false;
  }

  connect() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '127.0.0.1:8000' 
      : window.location.host;
    const wsUrl = `${wsProtocol}//${host}/api/v1/ws/`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        if (this.onStatusChange) this.onStatusChange(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (e) {
          console.debug('Raw WS message:', event.data);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        if (this.onStatusChange) this.onStatusChange(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        this.connected = false;
        if (this.onStatusChange) this.onStatusChange(false);
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}
