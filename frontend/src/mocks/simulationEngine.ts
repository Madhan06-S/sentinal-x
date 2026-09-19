import { initialIncidents, heroIncident, initialAlerts, initialServices, initialAuditLogs, initialAIActivity, initialRCAGraph } from './data/initialData';
import { Incident } from '../types/incident';
import { Alert } from '../types/alert';
import { ServiceInfo } from '../types/service';
import { AuditEntry } from '../types/audit';
import { AIActivityItem } from '../types/api';

type Listener = (event: { type: string; payload: any }) => void;

class SimulationEngine {
  private listeners: Set<Listener> = new Set();
  public incidents: Incident[] = JSON.parse(JSON.stringify(initialIncidents));
  public alerts: Alert[] = JSON.parse(JSON.stringify(initialAlerts));
  public services: ServiceInfo[] = JSON.parse(JSON.stringify(initialServices));
  public auditLogs: AuditEntry[] = JSON.parse(JSON.stringify(initialAuditLogs));
  public aiActivities: AIActivityItem[] = JSON.parse(JSON.stringify(initialAIActivity));
  public rcaGraph = JSON.parse(JSON.stringify(initialRCAGraph));
  public autonomyLevel: 'L1' | 'L2' | 'L3' | 'L4' = 'L3';

  public isSimulating = false;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(type: string, payload: any) {
    this.listeners.forEach((l) => l({ type, payload }));
  }

  public setAutonomyLevel(level: 'L1' | 'L2' | 'L3' | 'L4') {
    this.autonomyLevel = level;
    this.notify('AUTONOMY_UPDATED', { level });
  }

  public getAutonomyLevel() {
    return this.autonomyLevel;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.incident_id === id);
  }

  public async approveRemediation(incidentId: string): Promise<Incident> {
    const inc = this.getIncidentById(incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);

    inc.status = 'REMEDIATING';
    inc.updated_at = new Date().toISOString();
    if (inc.remediation) {
      inc.remediation.status = 'EXECUTING';
      inc.remediation.started_at = new Date().toISOString();
      inc.remediation.progress_percent = 25;
    }

    const newAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'Current Engineer (You)',
      actor_type: 'ENGINEER',
      action: 'Remediation Approval',
      resource: `${incidentId} (${inc.recommended_action || 'ROLLBACK'})`,
      incident_id: incidentId,
      result: 'SUCCESS',
      details: { action: inc.recommended_action },
    };
    this.auditLogs.unshift(newAudit);

    this.notify('INCIDENT_UPDATED', inc);
    this.notify('AUDIT_LOG_ADDED', newAudit);

    this.runRemediationExecution(inc);

    return inc;
  }

  public async rejectRemediation(incidentId: string, reason?: string): Promise<Incident> {
    const inc = this.getIncidentById(incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);

    inc.status = 'INVESTIGATING';
    inc.updated_at = new Date().toISOString();
    inc.approval_required = false;

    const newAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'Current Engineer (You)',
      actor_type: 'ENGINEER',
      action: 'Remediation Rejection',
      resource: incidentId,
      incident_id: incidentId,
      result: 'SUCCESS',
      details: { reason: reason || 'Manual engineer override' },
    };
    this.auditLogs.unshift(newAudit);

    this.notify('INCIDENT_UPDATED', inc);
    this.notify('AUDIT_LOG_ADDED', newAudit);
    return inc;
  }

  private async runRemediationExecution(inc: Incident) {
    const delays = [1200, 1500, 1500, 1200];
    
    await new Promise((r) => setTimeout(r, delays[0]));
    if (inc.remediation) {
      inc.remediation.progress_percent = 50;
      if (inc.remediation.verification_steps?.[0]) inc.remediation.verification_steps[0].status = 'PASSED';
      if (inc.remediation.verification_steps?.[1]) inc.remediation.verification_steps[1].status = 'IN_PROGRESS';
    }
    this.notify('INCIDENT_UPDATED', inc);

    await new Promise((r) => setTimeout(r, delays[1]));
    if (inc.remediation) {
      inc.remediation.progress_percent = 75;
      if (inc.remediation.verification_steps?.[1]) inc.remediation.verification_steps[1].status = 'PASSED';
      if (inc.remediation.verification_steps?.[2]) inc.remediation.verification_steps[2].status = 'IN_PROGRESS';
    }
    this.notify('INCIDENT_UPDATED', inc);

    await new Promise((r) => setTimeout(r, delays[2]));
    inc.status = 'VERIFYING';
    if (inc.remediation) {
      inc.remediation.status = 'VERIFYING';
      inc.remediation.progress_percent = 90;
      if (inc.remediation.verification_steps?.[2]) inc.remediation.verification_steps[2].status = 'PASSED';
      if (inc.remediation.verification_steps?.[3]) inc.remediation.verification_steps[3].status = 'IN_PROGRESS';
    }
    this.notify('INCIDENT_UPDATED', inc);

    await new Promise((r) => setTimeout(r, delays[3]));
    inc.status = 'RESOLVED';
    inc.resolved_at = new Date().toISOString();
    if (inc.remediation) {
      inc.remediation.status = 'COMPLETED';
      inc.remediation.progress_percent = 100;
      if (inc.remediation.verification_steps?.[3]) inc.remediation.verification_steps[3].status = 'PASSED';
    }

    const paymentSrv = this.services.find((s) => s.name === 'payment-service');
    if (paymentSrv) {
      paymentSrv.status = 'HEALTHY';
      paymentSrv.metrics.error_rate_percent = 0.01;
      paymentSrv.metrics.p99_latency_ms = 45;
      paymentSrv.version = 'v2.4.0';
      paymentSrv.active_alerts_count = 0;
    }

    const resAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'Sentinel Remediation Agent',
      actor_type: 'AI_ENGINE',
      action: 'Verification Passed & Incident Resolved',
      resource: inc.incident_id,
      incident_id: inc.incident_id,
      result: 'SUCCESS',
      details: { resolution_time_s: 184 },
    };
    this.auditLogs.unshift(resAudit);

    this.notify('SERVICES_UPDATED', this.services);
    this.notify('INCIDENT_UPDATED', inc);
    this.notify('AUDIT_LOG_ADDED', resAudit);
  }

  public async startLiveSimulation(): Promise<{ status: string; incident_id: string }> {
    this.isSimulating = true;
    const simIncId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAlert: Alert = {
      id: `ALT-${Math.floor(950 + Math.random() * 50)}`,
      source: 'Datadog Sentinel Probe',
      service: 'payment-service',
      alert_type: 'High Error Rate & DB Exhaustion',
      severity: 'CRITICAL',
      message: 'Simulated failure injection: memory_leak on payment-service',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    };
    this.alerts.unshift(newAlert);
    this.notify('NEW_ALERT', newAlert);

    const newInc: Incident = {
      incident_id: simIncId,
      title: 'Failure Injection: payment-db connection pool exhaustion',
      status: 'OPEN',
      severity: 'CRITICAL',
      affected_services: ['payment-service', 'postgresql-primary'],
      business_impact_summary: 'Simulated 78.4% payment failure rate',
      correlated_alert_ids: [newAlert.id],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.incidents.unshift(newInc);
    this.notify('NEW_INCIDENT', newInc);

    setTimeout(() => {
      newInc.status = 'INVESTIGATING';
      newInc.title = 'payment-db connection pool exhaustion';
      newInc.root_cause = 'Database connection pool exhaustion following deployment v2.4.1';
      newInc.confidence = 96;
      newInc.recommended_action = 'ROLLBACK_DEPLOYMENT';
      newInc.risk_level = 'MEDIUM';

      // Behavior per Autonomy Level
      if (this.autonomyLevel === 'L1') {
        newInc.status = 'INVESTIGATING';
        newInc.approval_required = false;
        newInc.remediation = undefined;
      } else if (this.autonomyLevel === 'L2') {
        newInc.status = 'INVESTIGATING';
        newInc.approval_required = false;
        newInc.remediation = {
          action: 'ROLLBACK_DEPLOYMENT',
          target_service: 'payment-service',
          status: 'RECOMMEND_ONLY' as any,
          progress_percent: 0,
          verification_steps: [],
        };
      } else if (this.autonomyLevel === 'L3') {
        // Medium risk -> Awaiting Approval
        newInc.status = 'AWAITING_APPROVAL';
        newInc.approval_required = true;
        newInc.remediation = JSON.parse(JSON.stringify(heroIncident.remediation));
      } else if (this.autonomyLevel === 'L4') {
        // Medium risk -> Auto-execute under L4!
        newInc.status = 'REMEDIATING';
        newInc.approval_required = false;
        newInc.remediation = JSON.parse(JSON.stringify(heroIncident.remediation));
        if (newInc.remediation) newInc.remediation.status = 'EXECUTING';
        this.runRemediationExecution(newInc);
      }

      this.notify('INCIDENT_UPDATED', newInc);
      this.isSimulating = false;
    }, 2500);

    return { status: 'SIMULATION_STARTED', incident_id: simIncId };
  }
}

export const simulationEngine = new SimulationEngine();
