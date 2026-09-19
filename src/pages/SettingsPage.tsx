import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Server, Database, Sparkles, Shield, Bell, Cpu, Clock, AlertTriangle, Key, CheckCircle2, RefreshCw } from 'lucide-react';
import { USE_MOCK_API } from '../api/client';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const [mockMode, setMockMode] = useState(USE_MOCK_API);
  const [autonomyLevel, setAutonomyLevel] = useState<'L1' | 'L2' | 'L3' | 'L4'>('L3');
  const [cpuThreshold, setCpuThreshold] = useState(85);
  const [memThreshold, setMemThreshold] = useState(80);
  const [latencyThreshold, setLatencyThreshold] = useState(250);
  const [errorRateThreshold, setErrorRateThreshold] = useState(2.0);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDB = () => {
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }, 1200);
  };

  const autonomyLevels = [
    {
      level: 'L1',
      title: 'L1: Advisory',
      description: 'AI only suggests root causes and remediation scripts. Human must approve and manually copy commands.',
    },
    {
      level: 'L2',
      title: 'L2: Semi-Autonomous',
      description: 'AI generates single-click execution proposals. Mandatory human approval for all actions.',
    },
    {
      level: 'L3',
      title: 'L3: Conditional Autonomy',
      description: 'Auto-executes safe remediations (confidence > 95%). Mandates human signoff for high-risk actions.',
    },
    {
      level: 'L4',
      title: 'L4: Full Autonomy',
      description: 'Full self-healing daemon. AI auto-executes, rolls back deployments, and scales resources automatically.',
    },
  ];

  return (
    <PageContainer
      title="System Settings & Engine Governance"
      description="Configure AI autonomy rules, anomaly detection thresholds, Groq LLM API integrations, and system simulation"
    >
      <div className="space-y-6 max-w-4xl">
        {/* Autonomy Level Governance Cards */}
        <Card title="AI Agent Autonomy Governance Level">
          <div className="space-y-3 font-sans">
            <p className="text-xs text-slate-600">
              Select the global operating mode for Aegis AI self-healing agents.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {autonomyLevels.map((item) => (
                <div
                  key={item.level}
                  onClick={() => setAutonomyLevel(item.level as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    autonomyLevel === item.level
                      ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{item.title}</span>
                    <input
                      type="radio"
                      name="autonomy"
                      checked={autonomyLevel === item.level}
                      onChange={() => setAutonomyLevel(item.level as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Anomaly Detection Threshold Sliders */}
        <Card title="Incident Trigger & Telemetry Thresholds">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-xs">
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" /> CPU Usage Threshold
                </span>
                <span className="font-mono font-bold text-blue-600 text-sm">{cpuThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={cpuThreshold}
                onChange={(e) => setCpuThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[11px] text-slate-500 block">Trigger incident if sustained above limit for 60s</span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-600" /> Memory Load Limit
                </span>
                <span className="font-mono font-bold text-indigo-600 text-sm">{memThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={memThreshold}
                onChange={(e) => setMemThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[11px] text-slate-500 block">Trigger heap dump alert on breach</span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> p99 Latency Limit
                </span>
                <span className="font-mono font-bold text-amber-600 text-sm">{latencyThreshold}ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={latencyThreshold}
                onChange={(e) => setLatencyThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-[11px] text-slate-500 block">Maximum acceptable response delay</span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Error Rate Tolerance
                </span>
                <span className="font-mono font-bold text-red-600 text-sm">{errorRateThreshold}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={errorRateThreshold}
                onChange={(e) => setErrorRateThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <span className="text-[11px] text-slate-500 block">HTTP 5xx error rate trigger limit</span>
            </div>
          </div>
        </Card>

        {/* Backend & LLM Integrations */}
        <Card title="Backend API & Groq LLM Engine Status">
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Active Execution Environment:</span>
                <StatusBadge status={mockMode ? 'warning' : 'success'} text={mockMode ? 'Interactive Demo (Mock Mode)' : 'Live FastAPI Backend connected'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">FastAPI REST Server:</span>
                <code className="text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                  {import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">WebSocket Event Stream:</span>
                <code className="text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                  {import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws'}
                </code>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-600 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-purple-600" /> Groq AI Model:
                </span>
                <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> openai/gpt-oss-120b (Configured • gsk_****)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone Card */}
        <div className="bg-red-50/60 rounded-xl border border-red-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-sm font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Danger Zone: Reset Simulation State
              </h3>
              <p className="text-xs text-red-700 font-sans mt-0.5">
                Purge all simulated active incidents, reset microservice health states, and clear audit history.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setIsResetModalOpen(true)}>
              Reset System State
            </Button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="Confirm Simulation Reset"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
              <p className="font-bold">Are you sure you want to reset the simulation state?</p>
              <p>This action will wipe all active incident feeds, restore microservice statuses to HEALTHY, and clear the local audit log.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setIsResetModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleResetDB} isLoading={isResetting} icon={RefreshCw}>
                Confirm Reset
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
};

