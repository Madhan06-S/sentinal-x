import React from 'react';
import { useApp } from '../../context/AppContext';
import { PlayCircle, Zap, ShieldAlert, ArrowRight } from 'lucide-react';

export default function DemoSimulatorView() {
  const { triggerSimulator, setActivePage, loading, simulationState } = useApp();

  const handleRunScenario = async (scenario) => {
    await triggerSimulator(scenario);
    setActivePage('workspace');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(37, 99, 235, 0.08))', borderColor: 'var(--accent-cyan-bg)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap style={{ color: 'var(--accent-cyan)' }} /> Autonomous Incident Resolution Engine — Simulator Controls
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '800px' }}>
          Test the end-to-end multi-signal ingestion, RAG document retrieval, Groq AI investigation, risk policy enforcement, human approval, simulated remediation, and metric threshold verification workflows.
        </p>
      </div>

      <div className="workspace-grid">
        {/* Scenario 1 Card */}
        <div className="panel" style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-green">RECOMMENDED DEMO</span>
            <span className="badge badge-high">HIGH RISK ACTION</span>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            🚀 Scenario 1: Payment Cascade Failure
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
            Simulates a multi-signal cascade beginning with deployment <code>v2.4.1</code> on <code>payment-service</code>, causing memory degradation (&gt;90%), database connection pool exhaustion (<code>DB-104</code>), latency spikes, and checkout failure rate alerts.
          </p>

          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '4px' }}>Expected AI Resolution Path:</div>
            1. Correlates 5 telemetry signals into single incident<br />
            2. RAG Knowledge retrieval finds matching DB connection pattern<br />
            3. Groq LLM identifies root cause: DB connection leak in v2.4.1<br />
            4. Recommends action: <code>ROLLBACK_DEPLOYMENT</code> (Risk: HIGH)<br />
            5. Enforces Policy Engine: Mandates Human Approval<br />
            6. Executes Simulated Remediation (Before vs After metrics)<br />
            7. Verifies metric recovery thresholds &amp; marks RESOLVED
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            onClick={() => handleRunScenario('cascade')}
            disabled={loading.simulator}
          >
            <PlayCircle size={18} /> Run Scenario 1 &amp; Open Workspace <ArrowRight size={16} />
          </button>
        </div>

        {/* Scenario 2 Card */}
        <div className="panel" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-amber">EDGE CASE DEMO</span>
            <span className="badge badge-escalated">SAFETY FALLBACK</span>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            ❓ Scenario 2: Insufficient Operational Evidence
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
            Simulates an isolated transient socket reset error on <code>notification-service</code> without preceding deployment history, RAG documentation, or correlated system metrics.
          </p>

          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: '700', color: 'var(--status-amber)', marginBottom: '4px' }}>Expected Responsible AI Path:</div>
            1. Ingests isolated telemetry signal<br />
            2. Evaluates evidence (no deployment, no correlated signals)<br />
            3. Outputs: <code>ROOT_CAUSE = UNKNOWN</code><br />
            4. Reasoning: <code>INSUFFICIENT_EVIDENCE</code><br />
            5. Confidence score bounded to low range (15%)<br />
            6. Recommends safe action: <code>ESCALATE</code><br />
            7. Prevents unsafe auto-remediation execution
          </div>

          <button
            className="btn btn-warning"
            style={{ width: '100%', padding: '12px' }}
            onClick={() => handleRunScenario('insufficient_evidence')}
            disabled={loading.simulator}
          >
            <ShieldAlert size={18} /> Run Scenario 2 &amp; Open Workspace <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
