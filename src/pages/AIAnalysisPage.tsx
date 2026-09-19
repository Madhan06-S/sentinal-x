import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { AIActivityStream } from '../components/dashboard/AIActivityStream';
import { Shield, Sparkles, TrendingUp, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

type AgentRole = 'ALL' | 'INVESTIGATION' | 'SKEPTIC' | 'DECISION' | 'REMEDIATION';
type AutonomyLevel = 'L1' | 'L2' | 'L3' | 'L4';

export const AIAnalysisPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState<AgentRole>('ALL');
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>('L3');

  const autonomyLevels: { id: AutonomyLevel; name: string; desc: string }[] = [
    { id: 'L1', name: 'L1 Advisory', desc: 'Read-only recommendations & alerts' },
    { id: 'L2', name: 'L2 Guarded', desc: 'Auto-remediates low-risk actions' },
    { id: 'L3', name: 'L3 Semi-Auto', desc: 'Autonomous with SRE approval' },
    { id: 'L4', name: 'L4 Full-Auto', desc: 'Fully autonomous resolution engine' },
  ];

  const agentRoles: AgentRole[] = ['ALL', 'INVESTIGATION', 'SKEPTIC', 'DECISION', 'REMEDIATION'];

  const topRootCauses = [
    { name: 'Database Connection Exhaustion', count: 18, percentage: 45 },
    { name: 'Memory Pool / JVM Heap Spike', count: 12, percentage: 30 },
    { name: 'Bad Microservice Deployment', count: 6, percentage: 15 },
    { name: 'Upstream API Gateway SLA Surges', count: 3, percentage: 8 },
    { name: 'Network Socket Reset / Timeout', count: 1, percentage: 2 },
  ];

  const actionsTaken = [
    { action: 'ROLLBACK_DEPLOYMENT', count: 14, color: 'bg-blue-600' },
    { action: 'RESTART_SERVICE', count: 9, color: 'bg-emerald-600' },
    { action: 'SCALE_SERVICE', count: 5, color: 'bg-indigo-600' },
    { action: 'CLEAR_CACHE', count: 3, color: 'bg-purple-600' },
  ];

  return (
    <PageContainer
      title="AI Agentic Investigation & Reasoning Hub"
      description="Live multi-agent AIOps reasoning stream, confidence fusion, and autonomous decision policy control."
    >
      {/* Top Segmented Control: Autonomy Selector */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-[15px] font-semibold text-slate-900">System Autonomy Policy Level</h3>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Configures the safety boundary and human-in-the-loop approval thresholds.
            </p>
          </div>

          <div className="flex items-center bg-[#F1F4F9] p-1.5 rounded-[10px] border border-[#E5E9F0]">
            {autonomyLevels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setAutonomyLevel(lvl.id)}
                className={cn(
                  'px-3.5 py-1.5 text-[12px] font-semibold rounded-lg transition-all font-sans',
                  autonomyLevel === lvl.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                {lvl.id}: {lvl.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Agent Activity Stream */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Agent Filter Pills */}
          <div className="bg-white border border-[#E5E9F0] rounded-[10px] p-3 shadow-card flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold uppercase text-slate-500 tracking-wider">
              Agent Stream Filter:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {agentRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-medium rounded-md transition-all font-sans',
                    activeRole === role
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-[#F1F4F9] text-slate-600 hover:text-slate-900'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Reasoning Activity Stream */}
          <AIActivityStream />
        </div>

        {/* Right Column: AI Insights & Statistics */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Avg Confidence Fusion Card */}
          <Card title="AI Confidence & Accuracy Fusion">
            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="p-4 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Avg Confidence
                </div>
                <div className="text-[28px] font-bold text-slate-900 font-mono mt-1">94.2%</div>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">▲ +2.1% vs last week</p>
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Escalation Rate
                </div>
                <div className="text-[28px] font-bold text-slate-900 font-mono mt-1">4.2%</div>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">▼ -1.5% escalation drop</p>
              </div>
            </div>
          </Card>

          {/* Most Common Root Causes Card */}
          <Card title="Top Identified Root Causes">
            <div className="space-y-3 mt-2">
              {topRootCauses.map((rc, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[12px] font-sans">
                    <span className="font-medium text-slate-800 truncate">{rc.name}</span>
                    <span className="font-mono text-slate-500 font-semibold">{rc.count} incidents</span>
                  </div>
                  <div className="w-full bg-[#F1F4F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${rc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions Executed This Week */}
          <Card title="Remediation Actions Executed">
            <div className="grid grid-cols-2 gap-3 mt-2">
              {actionsTaken.map((act) => (
                <div key={act.action} className="p-3 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-slate-600">
                    <span className={`w-2 h-2 rounded-full ${act.color}`} />
                    {act.action}
                  </div>
                  <div className="text-[22px] font-bold text-slate-900 font-mono mt-1">{act.count}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
