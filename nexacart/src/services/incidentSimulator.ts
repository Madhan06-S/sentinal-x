import {
  StructuredIncidentEvent,
  SystemHealthStatus,
  SystemMetrics,
  IncidentTimelineStep,
  AllowedRemediationAction,
} from '../types/incident';
import { sendEventToEngine } from '../api/events';

type StateListener = () => void;

const BASELINE_METRICS: SystemMetrics = {
  memory_usage: 42,
  db_connections: 35,
  max_connections: 100,
  api_latency: 0.18, // 180ms
  payment_failure_rate: 0.8,
};

const INITIAL_TIMELINE: IncidentTimelineStep[] = [
  {
    id: 1,
    label: 'Deployment Created',
    code: 'DEP-001',
    phase: 'Phase 2: CI/CD Deployment',
    delaySec: 0,
    status: 'pending',
    description: 'Release v2.14.0 promoted to production by release-bot',
  },
  {
    id: 2,
    label: 'Memory Spike',
    code: 'MEM-101',
    phase: 'Phase 3: Memory Degradation',
    delaySec: 2,
    status: 'pending',
    description: 'Memory footprint exceeded safe threshold (94%)',
  },
  {
    id: 3,
    label: 'DB Connection Pool Exhaustion',
    code: 'DB-104',
    phase: 'Phase 4: Database Saturation',
    delaySec: 4,
    status: 'pending',
    description: 'All 100/100 active connections exhausted; pool starvation',
  },
  {
    id: 4,
    label: 'API Latency Surge',
    code: 'API-201',
    phase: 'Phase 5: Gateway Latency',
    delaySec: 6,
    status: 'pending',
    description: 'P99 response latency breached SLA (4.8 seconds)',
  },
  {
    id: 5,
    label: 'Payment Service Failures',
    code: 'PAY-301',
    phase: 'Phase 6: Business Symptom',
    delaySec: 8,
    status: 'pending',
    description: 'Payment failure rate surged to 31% due to pool timeout',
  },
];

class IncidentSimulatorService {
  private status: SystemHealthStatus = 'HEALTHY';
  private metrics: SystemMetrics = { ...BASELINE_METRICS };
  private events: StructuredIncidentEvent[] = [];
  private timeline: IncidentTimelineStep[] = JSON.parse(JSON.stringify(INITIAL_TIMELINE));
  private listeners: Set<StateListener> = new Set();
  private activeTimeouts: NodeJS.Timeout[] = [];
  private isSimulating = false;
  private backendDeliveryStatus: 'CONNECTED' | 'OFFLINE' | 'UNKNOWN' = 'UNKNOWN';
  private lastRemediationAction: string | null = null;
  private remediationInProgress = false;

  constructor() {
    this.syncWithServer();
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
    this.syncWithServer();
  }

  private async syncWithServer(): Promise<void> {
    try {
      await fetch('/api/state-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: this.status,
          memory_usage: this.metrics.memory_usage,
          db_connections: this.metrics.db_connections,
          api_latency: this.metrics.api_latency,
          payment_failure_rate: this.metrics.payment_failure_rate,
          active_incident: this.status !== 'HEALTHY',
        }),
      });
    } catch {
      // ignore sync errors in offline mode
    }
  }

  // Getters
  public getStatus(): SystemHealthStatus {
    return this.status;
  }

  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public getEvents(): StructuredIncidentEvent[] {
    return [...this.events];
  }

  public getTimeline(): IncidentTimelineStep[] {
    return JSON.parse(JSON.stringify(this.timeline));
  }

  public getIsSimulating(): boolean {
    return this.isSimulating;
  }

  public getBackendDeliveryStatus(): 'CONNECTED' | 'OFFLINE' | 'UNKNOWN' {
    return this.backendDeliveryStatus;
  }

  public getLastRemediationAction(): string | null {
    return this.lastRemediationAction;
  }

  public isRemediating(): boolean {
    return this.remediationInProgress;
  }

  /**
   * Dispatches a structured telemetry log.
   */
  public logEvent(event: StructuredIncidentEvent): void {
    this.events.unshift(event); // newest first for console display
    if (this.events.length > 50) this.events.pop();

    // Asynchronously transmit to incident engine
    sendEventToEngine(event).then((res) => {
      this.backendDeliveryStatus = res.delivered ? 'CONNECTED' : 'OFFLINE';
      this.notify();
    });

    this.notify();
  }

  /**
   * Starts the reproducible 5-stage incident simulation scenario.
   */
  public startIncident(): void {
    this.cancelActiveTimers();
    this.isSimulating = true;
    this.status = 'DEGRADED';
    this.timeline = JSON.parse(JSON.stringify(INITIAL_TIMELINE));

    const nowIso = () => new Date().toISOString();

    // ─────────────────────────────────────────────────────────────
    // T+0s: DEP-001 Deployment Created
    // ─────────────────────────────────────────────────────────────
    const t0 = setTimeout(() => {
      this.timeline[0].status = 'active';
      this.timeline[0].timestamp = new Date().toLocaleTimeString();

      this.logEvent({
        timestamp: nowIso(),
        service: 'deployment-service',
        event_type: 'deployment',
        severity: 'INFO',
        error_code: 'DEP-001',
        message: 'Deployment v2.14.0 created by @ci-bot (commit: #a8f3b92)',
        environment: 'demo',
        metadata: {
          commit_sha: 'a8f3b92c108',
          author: 'release-bot',
          branch: 'main',
          deployed_version: 'v2.14.0',
          previous_version: 'v2.13.9',
        },
      });

      this.timeline[0].status = 'completed';
      this.notify();
    }, 100);
    this.activeTimeouts.push(t0);

    // ─────────────────────────────────────────────────────────────
    // T+2s: MEM-101 Memory Spike
    // ─────────────────────────────────────────────────────────────
    const t1 = setTimeout(() => {
      this.timeline[1].status = 'active';
      this.timeline[1].timestamp = new Date().toLocaleTimeString();

      this.metrics = {
        ...this.metrics,
        memory_usage: 94,
      };

      this.logEvent({
        timestamp: nowIso(),
        service: 'payment-service',
        event_type: 'resource_alert',
        severity: 'WARNING',
        error_code: 'MEM-101',
        message: 'Memory usage exceeded critical threshold (94%)',
        environment: 'demo',
        metadata: {
          memory_usage_pct: 94,
          threshold_pct: 85,
          jvm_heap_used_mb: 3850,
          jvm_heap_max_mb: 4096,
        },
      });

      this.timeline[1].status = 'completed';
      this.notify();
    }, 2000);
    this.activeTimeouts.push(t1);

    // ─────────────────────────────────────────────────────────────
    // T+4s: DB-104 Connection Pool Exhaustion
    // ─────────────────────────────────────────────────────────────
    const t2 = setTimeout(() => {
      this.timeline[2].status = 'active';
      this.timeline[2].timestamp = new Date().toLocaleTimeString();

      this.metrics = {
        ...this.metrics,
        db_connections: 100,
      };

      this.logEvent({
        timestamp: nowIso(),
        service: 'payment-service',
        event_type: 'database_error',
        severity: 'CRITICAL',
        error_code: 'DB-104',
        message: 'Database connection pool exhausted',
        environment: 'demo',
        metadata: {
          active_connections: 100,
          max_connections: 100,
          queued_acquisition_requests: 48,
          pool_name: 'HikariCP-PaymentDB',
        },
      });

      this.timeline[2].status = 'completed';
      this.notify();
    }, 4000);
    this.activeTimeouts.push(t2);

    // ─────────────────────────────────────────────────────────────
    // T+6s: API-201 API Latency Surge
    // ─────────────────────────────────────────────────────────────
    const t3 = setTimeout(() => {
      this.timeline[3].status = 'active';
      this.timeline[3].timestamp = new Date().toLocaleTimeString();

      this.metrics = {
        ...this.metrics,
        api_latency: 4.8, // 4.8s
      };

      this.logEvent({
        timestamp: nowIso(),
        service: 'payment-service',
        event_type: 'api_degradation',
        severity: 'CRITICAL',
        error_code: 'API-201',
        message: 'API latency exceeded critical threshold (4.8 seconds)',
        environment: 'demo',
        metadata: {
          latency_sec: 4.8,
          threshold_sec: 1.0,
          endpoint: 'POST /api/v1/payments/process',
          p99_latency_ms: 4800,
        },
      });

      this.timeline[3].status = 'completed';
      this.notify();
    }, 6000);
    this.activeTimeouts.push(t3);

    // ─────────────────────────────────────────────────────────────
    // T+8s: PAY-301 Payment Failure Rate High
    // ─────────────────────────────────────────────────────────────
    const t4 = setTimeout(() => {
      this.timeline[4].status = 'active';
      this.timeline[4].timestamp = new Date().toLocaleTimeString();

      this.status = 'CRITICAL';
      this.isSimulating = false;
      this.metrics = {
        ...this.metrics,
        payment_failure_rate: 31.0,
      };

      this.logEvent({
        timestamp: nowIso(),
        service: 'payment-service',
        event_type: 'payment_failure',
        severity: 'CRITICAL',
        error_code: 'PAY-301',
        message: 'Payment failure rate exceeded threshold (31%)',
        environment: 'demo',
        metadata: {
          failure_rate_pct: 31.0,
          threshold_pct: 5.0,
          failed_tx_count_last_min: 78,
          root_error: 'ConnectionTimeoutException: Unable to acquire connection from pool within 30000ms',
        },
      });

      this.timeline[4].status = 'completed';
      this.notify();
    }, 8000);
    this.activeTimeouts.push(t4);

    this.notify();
  }

  /**
   * Triggers a progressive safe simulated remediation (e.g. ROLLBACK_DEPLOYMENT).
   */
  public executeRemediation(action: AllowedRemediationAction): void {
    this.cancelActiveTimers();
    this.remediationInProgress = true;
    this.lastRemediationAction = action;
    this.status = 'RECOVERING';
    this.notify();

    const nowIso = () => new Date().toISOString();

    // Step 1: Remediation received
    this.logEvent({
      timestamp: nowIso(),
      service: 'incident-engine',
      event_type: 'remediation_event',
      severity: 'INFO',
      error_code: 'DEP-001',
      message: `Remediation action '${action}' initiated by Autonomous Incident Resolution Engine.`,
      environment: 'demo',
      metadata: {
        action,
        status: 'EXECUTING',
        target_version: 'v2.13.9',
      },
    });

    // Step 2: Step-by-step metric recovery
    const r1 = setTimeout(() => {
      // Memory recovers
      this.metrics.memory_usage = 65;
      this.notify();
    }, 800);

    const r2 = setTimeout(() => {
      // DB connections drain & unblock
      this.metrics.db_connections = 60;
      this.metrics.api_latency = 1.2;
      this.notify();
    }, 1600);

    const r3 = setTimeout(() => {
      // Payment service healthy & verified
      this.metrics = {
        memory_usage: 45,
        db_connections: 42,
        max_connections: 100,
        api_latency: 0.18, // 180ms
        payment_failure_rate: 0.8,
      };
      this.status = 'HEALTHY';
      this.remediationInProgress = false;
      this.isSimulating = false;

      this.logEvent({
        timestamp: nowIso(),
        service: 'payment-service',
        event_type: 'remediation_event',
        severity: 'INFO',
        error_code: 'DEP-001',
        message: `Deployment rolled back to stable release v2.13.9. All subsystems verified HEALTHY.`,
        environment: 'demo',
        metadata: {
          action,
          status: 'VERIFIED_HEALTHY',
          active_version: 'v2.13.9',
          metrics_after: { ...this.metrics },
        },
      });

      this.notify();
    }, 2400);

    this.activeTimeouts.push(r1, r2, r3);
  }

  /**
   * Resets simulation back to clean baseline state.
   */
  public resetSimulation(): void {
    this.cancelActiveTimers();
    this.status = 'HEALTHY';
    this.metrics = { ...BASELINE_METRICS };
    this.timeline = JSON.parse(JSON.stringify(INITIAL_TIMELINE));
    this.isSimulating = false;
    this.remediationInProgress = false;
    this.lastRemediationAction = null;
    this.notify();
  }

  private cancelActiveTimers(): void {
    this.activeTimeouts.forEach((t) => clearTimeout(t));
    this.activeTimeouts = [];
  }
}

// Global Singleton instance
export const incidentSimulator = new IncidentSimulatorService();
