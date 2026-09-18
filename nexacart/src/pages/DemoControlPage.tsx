import React from 'react';
import { useIncidentSimulation } from '../hooks/useIncidentSimulation';
import { StatusBadge } from '../components/simulator/StatusBadge';
import { MetricsDisplay } from '../components/simulator/MetricsDisplay';
import { TimelineView } from '../components/simulator/TimelineView';
import { EventLogStream } from '../components/simulator/EventLogStream';
import { getIncidentEngineUrl } from '../api/client';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  Server,
  Terminal,
  Activity,
  ArrowRight,
  Sparkles,
  GitBranch,
} from 'lucide-react';

interface DemoControlPageProps {
  onNavigate: (view: string) => void;
}

export const DemoControlPage: React.FC<DemoControlPageProps> = ({ onNavigate }) => {
  const {
    status,
    metrics,
    events,
    timeline,
    isSimulating,
    backendStatus,
    lastRemediation,
    isRemediating,
    startIncident,
    resetSimulation,
    executeRemediation,
  } = useIncidentSimulation();

  const engineUrl = getIncidentEngineUrl();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Control Panel Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold tracking-wider uppercase">
              <Terminal className="w-4 h-4" />
              <span>Autonomous Incident Resolution Engine · Monitored Demo Target</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Operational Incident Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Generate deterministic, reproducible failure sequences for live judge demonstrations.
              Emits structured telemetry (<code className="text-indigo-300">DEP-001</code>, <code className="text-indigo-300">MEM-101</code>, <code className="text-indigo-300">DB-104</code>, <code className="text-indigo-300">API-201</code>, <code className="text-indigo-300">PAY-301</code>) consumed by the incident backend.
            </p>
          </div>

          {/* Right Status Indicators */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
            <div>
              <span className="text-[11px] text-slate-400 font-mono block">Current System State</span>
              <div className="mt-1">
                <StatusBadge status={status} size="md" />
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-700 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[11px] text-slate-400 font-mono block">Incident Engine Backend</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus === 'CONNECTED'
                      ? 'bg-emerald-400'
                      : backendStatus === 'OFFLINE'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-mono text-slate-200">
                  {backendStatus === 'CONNECTED'
                    ? 'Engine Connected'
                    : backendStatus === 'OFFLINE'
                    ? 'Offline (Buffering locally)'
                    : 'Awaiting first event'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[180px]">
                {engineUrl}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scenario Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-indigo-600">
                Primary Demonstration Scenario
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Payment Service Degradation (HikariCP Pool Starvation)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetSimulation}
                disabled={isSimulating || isRemediating}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset / Normalize</span>
              </button>

              <button
                onClick={startIncident}
                disabled={isSimulating || status === 'CRITICAL' || isRemediating}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? 'Simulation Running...' : 'START INCIDENT'}</span>
              </button>
            </div>
          </div>

          {/* Sequential Timeline Component */}
          <TimelineView timeline={timeline} isSimulating={isSimulating} />

          {/* Metrics Display */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Live System Telemetry Gauges (GET /api/health)</span>
            </h3>
            <MetricsDisplay metrics={metrics} />
          </div>
        </div>

        {/* Right Action & Remediation Controller */}
        <div className="lg:col-span-4 space-y-6">
          {/* Remediation Execution Hook Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Remediation Control Hook</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              When the Autonomous Incident Engine investigates the correlated root cause via RAG + Groq, it triggers:
            </p>

            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs space-y-1">
              <span className="text-slate-400 text-[10px]">Predefined Action:</span>
              <div className="font-bold text-slate-800">POST /api/remediation</div>
              <div className="text-[11px] text-indigo-600 font-semibold">{`{"action": "ROLLBACK_DEPLOYMENT"}`}</div>
            </div>

            {/* Simulated Remediation Trigger Button */}
            <button
              onClick={() => executeRemediation('ROLLBACK_DEPLOYMENT')}
              disabled={status === 'HEALTHY' || isRemediating}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRemediating ? 'Rolling back deployment...' : 'Simulate Engine Remediation'}</span>
            </button>

            {/* Remediation Status Feedback */}
            {lastRemediation && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Remediation Applied: {lastRemediation}</span>
                </div>
                <ul className="text-[11px] text-emerald-800 space-y-0.5 pl-4 list-disc">
                  <li>Deployment rolled back to stable release v2.13.9</li>
                  <li>Memory footprint released (94% → 45%)</li>
                  <li>Database connection pool cleared (100 → 42)</li>
                  <li>API response latency restored (4.8s → 180ms)</li>
                  <li>Payment failure rate resolved (31% → 0.8%)</li>
                </ul>
                <div className="text-[10px] font-mono text-emerald-700 font-semibold pt-1">
                  Status: SYSTEM HEALTHY & VERIFIED
                </div>
              </div>
            )}
          </div>

          {/* Quick Links & Customer Experience Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Customer Symptom Test
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify customer business impact during an active incident:
            </p>
            <button
              onClick={() => onNavigate('payment')}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Test Payment Flow (/payment)</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Structured Telemetry Stream Console */}
      <EventLogStream events={events} />

      {/* API Verification Documentation Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-3">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          HTTP Endpoints for Autonomous Incident Resolution Engine
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-indigo-600 font-bold">GET /health</span>
            <p className="text-slate-500 font-sans mt-1">Lightweight liveness check for microservice registry.</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-indigo-600 font-bold">GET /api/health</span>
            <p className="text-slate-500 font-sans mt-1">Full telemetry state & metrics (memory, connections, latency, errors).</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-indigo-600 font-bold">POST /api/remediation</span>
            <p className="text-slate-500 font-sans mt-1">Executes safe simulated action (ROLLBACK_DEPLOYMENT).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
