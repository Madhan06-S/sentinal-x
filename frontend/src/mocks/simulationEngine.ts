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

  public isSimulating = false;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(type: string, payload: any) {
    this.listeners.forEach((l) => l({ type, payload }));
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

    // Add audit entry
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

    // Simulate remediation steps execution asynchronously
    this.runRemediationExecution(inc);

    return inc;
  }

  public async rejectRemediation(incidentId: string, reason?: string): Promise<Incident> {
    const inc = this.getIncidentById(incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);

    inc.status = 'OPEN';
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
    const delays = [1500, 2000, 2500, 2000];
    
    // Step 1: Executing rollback
    await new Promise((r) => setTimeout(r, delays[0]));
    if (inc.remediation) {
      inc.remediation.progress_percent = 50;
      inc.remediation.verification_steps[0].status = 'PASSED';
      inc.remediation.verification_steps[1].status = 'IN_PROGRESS';
    }
    this.notify('INCIDENT_UPDATED', inc);

    // Step 2: Pool flushing
    await new Promise((r) => setTimeout(r, delays[1]));
    if (inc.remediation) {
      inc.remediation.progress_percent = 75;
      inc.remediation.verification_steps[1].status = 'PASSED';
      inc.remediation.verification_steps[2].status = 'IN_PROGRESS';
    }
    this.notify('INCIDENT_UPDATED', inc);

    // Step 3: Error rate normalization & verification
    await new Promise((r) => setTimeout(r, delays[2]));
    inc.status = 'VERIFYING';
    if (inc.remediation) {
      inc.remediation.status = 'VERIFYING';
      inc.remediation.progress_percent = 90;
      inc.remediation.verification_steps[2].status = 'PASSED';
      inc.remediation.verification_steps[3].status = 'IN_PROGRESS';
    }
    this.notify('INCIDENT_UPDATED', inc);

    // Step 4: Final verification & Resolution!
    await new Promise((r) => setTimeout(r, delays[3]));
    inc.status = 'RESOLVED';
    inc.resolved_at = new Date().toISOString();
    if (inc.remediation) {
      inc.remediation.status = 'COMPLETED';
      inc.remediation.progress_percent = 100;
      inc.remediation.verification_steps[3].status = 'PASSED';
    }

    // Recover services
    const paymentSrv = this.services.find((s) => s.name === 'payment-service');
    if (paymentSrv) {
      paymentSrv.status = 'HEALTHY';
      paymentSrv.metrics.error_rate_percent = 0.01;
      paymentSrv.metrics.p99_latency_ms = 45;
      paymentSrv.version = 'v2.4.0';
      paymentSrv.active_alerts_count = 0;
    }
    const dbSrv = this.services.find((s) => s.name === 'postgresql-primary');
    if (dbSrv) {
      dbSrv.status = 'HEALTHY';
      dbSrv.metrics.error_rate_percent = 0.0;
      dbSrv.metrics.cpu_percent = 18;
    }

    const resAudit: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'Aegis Remediation Agent',
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
    if (this.isSimulating) return { status: 'ALREADY_RUNNING', incident_id: 'INC-1042' };

    this.isSimulating = true;
    const simIncId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAlert: Alert = {
      id: `ALT-${Math.floor(950 + Math.random() * 50)}`,
      source: 'Datadog Sentinel Probe',
      service: 'payment-service',
      alert_type: 'High Error Rate & DB Exhaustion',
      severity: 'CRITICAL',
      message: 'Simulated alert storm detected across payment pipeline',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    };
    this.alerts.unshift(newAlert);
    this.notify('NEW_ALERT', newAlert);

    // Create fresh incident
    const newInc: Incident = {
      incident_id: simIncId,
      title: 'Automated Demo: Checkout API Failure & DB Pool Saturation',
      status: 'OPEN',
      severity: 'CRITICAL',
      affected_services: ['payment-service', 'postgresql-primary'],
      business_impact_summary: 'Simulated 82% payment failure rate',
      correlated_alert_ids: [newAlert.id],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.incidents.unshift(newInc);
    this.notify('NEW_INCIDENT', newInc);

    // Sequence the AI pipeline
    setTimeout(() => {
      newInc.status = 'INVESTIGATING';
      newInc.timeline = [
        { id: 'st-1', timestamp: new Date().toLocaleTimeString(), title: 'Alert Storm Detected', description: 'Received 12 high-severity alerts within 5s window', type: 'ALERT' },
        { id: 'st-2', timestamp: new Date().toLocaleTimeString(), title: 'AI Investigation Active', description: 'Building causal graph and probing microservice telemetry', type: 'AI_EVENT' },
      ];
      this.notify('INCIDENT_UPDATED', newInc);
    }, 2000);

    setTimeout(() => {
      newInc.status = 'AWAITING_APPROVAL';
      newInc.root_cause = 'Database Connection Exhaustion from unclosed statement handles in payment-service v2.4.1';
      newInc.confidence = 96;
      newInc.recommended_action = 'ROLLBACK_DEPLOYMENT';
      newInc.risk_level = 'MEDIUM';
      newInc.approval_required = true;
      newInc.timeline?.push({
        id: 'st-3',
        timestamp: new Date().toLocaleTimeString(),
        title: 'Root Cause Identified',
        description: 'AI model isolated payment-service v2.4.1 as source of DB socket exhaustion (96% confidence)',
        type: 'AI_EVENT',
      });
      newInc.ai_investigation = JSON.parse(JSON.stringify(heroIncident.ai_investigation));
      newInc.ai_decision = JSON.parse(JSON.stringify(heroIncident.ai_decision));
      newInc.business_impact_details = JSON.parse(JSON.stringify(heroIncident.business_impact_details));
      newInc.remediation = JSON.parse(JSON.stringify(heroIncident.remediation));
      
      this.notify('INCIDENT_UPDATED', newInc);
      this.isSimulating = false;
    }, 5000);

    return { status: 'SIMULATION_STARTED', incident_id: simIncId };
  }
}

export const simulationEngine = new SimulationEngine();
