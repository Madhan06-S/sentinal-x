import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Building2,
  SlidersHorizontal,
  Shield,
  Plug,
  Key,
  AlertTriangle,
  Cpu,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';

import { useAutonomy } from '../hooks/useAutonomy';

type SettingsTab = 'workspace' | 'thresholds' | 'autonomy' | 'integrations' | 'api_keys' | 'danger';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('workspace');
  const { autonomyLevel, setAutonomyLevel, autonomyLevels } = useAutonomy();
  const [cpuThreshold, setCpuThreshold] = useState(85);
  const [memThreshold, setMemThreshold] = useState(80);
  const [latencyThreshold, setLatencyThreshold] = useState(250);
  const [errorRateThreshold, setErrorRateThreshold] = useState(2.0);

  const [apiKey, setApiKey] = useState('sn_live_9f82d1c9a40b82f1e290a3c');
  const [isCopied, setIsCopied] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const navItems = [
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'thresholds', label: 'Alert Thresholds', icon: SlidersHorizontal },
    { id: 'autonomy', label: 'Autonomy Policy', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'api_keys', label: 'API Keys', icon: Key },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ];

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newK = 'sn_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newK);
  };

  const handleResetDB = () => {
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }, 1200);
  };



  const integrations = [
    { name: 'Slack', status: 'CONNECTED', icon: '💬', desc: 'Real-time incident notifications & interactive approval blocks' },
    { name: 'PagerDuty', status: 'CONNECTED', icon: '📟', desc: 'Bi-directional incident sync and on-call escalation routing' },
    { name: 'Jira Software', status: 'CONNECTED', icon: '📋', desc: 'Automatic post-mortem ticket creation & SLA tracking' },
    { name: 'Datadog', status: 'DISCONNECTED', icon: '🐶', desc: 'Telemetry metric stream & APM trace ingestion' },
    { name: 'Amazon CloudWatch', status: 'CONNECTED', icon: '☁️', desc: 'AWS infrastructure metrics & log stream exporter' },
  ];

  return (
    <PageContainer
      title="Settings & Platform Governance"
      description="Manage workspace configuration, alert thresholds, agent autonomy safety bounds, and integrations"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-sans">
        {/* Left Sub-Nav (3 cols) */}
        <div className="md:col-span-3 space-y-1">
          <div className="bg-white border border-[#E5E9F0] rounded-xl p-2 shadow-card space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left cursor-pointer',
                    activeTab === item.id
                      ? item.danger
                        ? 'bg-red-50 text-red-700 font-semibold'
                        : 'bg-blue-50 text-blue-700 font-semibold'
                      : item.danger
                      ? 'text-red-600 hover:bg-red-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className={cn('w-4 h-4', activeTab === item.id ? (item.danger ? 'text-red-600' : 'text-blue-600') : 'text-slate-400')} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area (9 cols) */}
        <div className="md:col-span-9 space-y-6">
          {activeTab === 'workspace' && (
            <Card title="Workspace Settings" subtitle="Global organization and region configuration">
              <div className="space-y-4 pt-2 text-[13px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Workspace ID / Slug</label>
                    <input
                      type="text"
                      disabled
                      value="acme-corp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Primary Cloud Region</label>
                    <input
                      type="text"
                      disabled
                      value="us-east-1 (N. Virginia)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Corporation Inc."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="primary" size="sm">Save Workspace Changes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'thresholds' && (
            <Card title="Alert Anomaly Thresholds" subtitle="Configure telemetry breach limits for automatic incident creation">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-[12px]">
                <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E9F0]">
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
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[11px] text-slate-500 block">Trigger incident if sustained above limit for 60s</span>
                </div>

                <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E9F0]">
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
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[11px] text-slate-500 block">Trigger heap dump alert on breach</span>
                </div>

                <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E9F0]">
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
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <span className="text-[11px] text-slate-500 block">Maximum acceptable response delay</span>
                </div>

                <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E9F0]">
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
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <span className="text-[11px] text-slate-500 block">HTTP 5xx error rate trigger limit</span>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'autonomy' && (
            <Card title="Agent Autonomy Policy Governance" subtitle="Set safety bounds for autonomous remediation actions">
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {autonomyLevels.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => setAutonomyLevel(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        autonomyLevel === item.id
                          ? 'bg-blue-50/70 border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                          : 'bg-white border-[#E5E9F0] hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[13px] font-bold text-slate-900">{item.id}: {item.name}</span>
                        <input
                          type="radio"
                          name="autonomy"
                          checked={autonomyLevel === item.id}
                          onChange={() => setAutonomyLevel(item.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card title="Connected Integrations" subtitle="Third-party monitoring, alerting, and ticketing integrations">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {integrations.map((integ) => (
                  <div key={integ.name} className="p-3.5 bg-[#F8FAFC] border border-[#E5E9F0] rounded-xl flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{integ.icon}</span>
                        <div>
                          <h4 className="font-bold text-[13px] text-slate-900">{integ.name}</h4>
                          <p className="text-[11px] text-slate-500">{integ.desc}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#E5E9F0]">
                      <span className="text-[10px] font-mono font-semibold flex items-center gap-1">
                        {integ.status === 'CONNECTED' ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-slate-400" /> Disconnected
                          </span>
                        )}
                      </span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'api_keys' && (
            <Card title="API Keys & Tokens" subtitle="Manage programmatic access keys for Sentinel-X APIs">
              <div className="space-y-4 pt-2 text-[13px]">
                <div className="p-4 bg-[#F8FAFC] border border-[#E5E9F0] rounded-xl space-y-3">
                  <label className="block text-slate-700 font-semibold">Production Ingestion API Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={apiKey}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900 font-semibold"
                    />
                    <Button variant="outline" size="sm" onClick={handleCopyKey} icon={Copy}>
                      {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRegenerateKey} icon={RefreshCw}>
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Use this token in your HTTP headers: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">X-Sentinel-Key: {apiKey}</code>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'danger' && (
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-[14px] font-bold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Danger Zone: Reset Environment State
                  </h3>
                  <p className="text-[12px] text-red-700 mt-0.5">
                    Purge active incident feeds, restore microservices health state, and reset local cache.
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setIsResetModalOpen(true)}>
                  Reset System State
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Environment Reset"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
            <p className="font-bold">Are you sure you want to reset environment state?</p>
            <p>This action will clear all active incident feeds, restore microservices to HEALTHY, and wipe telemetry history.</p>
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
    </PageContainer>
  );
};
