import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';

// In-memory simulation state for the dev server API endpoints
// This allows external tools (cURL, Python scripts, the incident engine) to query NexaCart directly
const systemState = {
  status: 'HEALTHY' as 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'RECOVERING',
  service: 'payment-service',
  memory_usage: 42,
  db_connections: 35,
  api_latency: 0.18, // 180ms in seconds
  payment_failure_rate: 0.8,
  active_incident: false,
  last_remediation: null as string | null,
};

function apiMiddleware() {
  return {
    name: 'nexacart-api-endpoints',
    configureServer(server: any) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url?.split('?')[0];

        // 1. GET /health
        if (req.method === 'GET' && url === '/health') {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({
            status: systemState.status.toLowerCase(),
            service: 'nexacart',
            timestamp: new Date().toISOString()
          }));
          return;
        }

        // 2. GET /api/health
        if (req.method === 'GET' && url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({
            service: systemState.service,
            status: systemState.status.toLowerCase(),
            memory_usage: systemState.memory_usage,
            db_connections: systemState.db_connections,
            api_latency: systemState.api_latency,
            payment_failure_rate: systemState.payment_failure_rate,
            timestamp: new Date().toISOString()
          }));
          return;
        }

        // 3. POST /api/remediation
        if (req.method === 'POST' && url === '/api/remediation') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const action = data.action;

              const validActions = [
                'ROLLBACK_DEPLOYMENT',
                'RESTART_SERVICE',
                'RECOVER_DATABASE',
                'RESET_PAYMENT_SERVICE'
              ];

              if (!validActions.includes(action)) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(400);
                res.end(JSON.stringify({
                  error: 'INVALID_REMEDIATION_ACTION',
                  message: `Action '${action}' is not permitted. Allowed actions: ${validActions.join(', ')}`
                }));
                return;
              }

              // Apply safe rollback simulation
              if (action === 'ROLLBACK_DEPLOYMENT' || action === 'RESET_PAYMENT_SERVICE' || action === 'RESTART_SERVICE') {
                systemState.status = 'HEALTHY';
                systemState.memory_usage = 45;
                systemState.db_connections = 42;
                systemState.api_latency = 0.18;
                systemState.payment_failure_rate = 0.8;
                systemState.active_incident = false;
                systemState.last_remediation = action;
              }

              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200);
              res.end(JSON.stringify({
                status: 'REMEDIATION_SUCCESS',
                action,
                message: `Remediation action '${action}' applied successfully. System restored to HEALTHY.`,
                metrics_after: {
                  memory_usage: systemState.memory_usage,
                  db_connections: systemState.db_connections,
                  api_latency: systemState.api_latency,
                  payment_failure_rate: systemState.payment_failure_rate,
                  status: systemState.status
                },
                timestamp: new Date().toISOString()
              }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'MALFORMED_JSON', message: err.message }));
            }
          });
          return;
        }

        // 4. POST /api/state-sync (Internal bridge to sync in-browser simulator with server endpoints)
        if (req.method === 'POST' && url === '/api/state-sync') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (data.status) systemState.status = data.status;
              if (data.memory_usage !== undefined) systemState.memory_usage = data.memory_usage;
              if (data.db_connections !== undefined) systemState.db_connections = data.db_connections;
              if (data.api_latency !== undefined) systemState.api_latency = data.api_latency;
              if (data.payment_failure_rate !== undefined) systemState.payment_failure_rate = data.payment_failure_rate;
              if (data.active_incident !== undefined) systemState.active_incident = data.active_incident;

              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200);
              res.end(JSON.stringify({ synced: true }));
            } catch {
              res.writeHead(400);
              res.end('{}');
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddleware()],
  server: {
    port: 5173,
    host: true,
  },
});
