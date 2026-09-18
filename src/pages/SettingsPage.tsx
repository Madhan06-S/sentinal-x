import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Server, Database, Sparkles, Shield, Bell } from 'lucide-react';
import { USE_MOCK_API } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [mockMode, setMockMode] = useState(USE_MOCK_API);

  return (
    <PageContainer
      title="System Settings & Backend Configuration"
      description="Configure API connection parameters, AI engine thresholds, and simulation modes"
    >
      <div className="space-y-6 max-w-3xl">
        <Card title="Backend API Connection Configuration">
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Execution Mode:</span>
                <span className={`px-2.5 py-1 rounded font-bold ${mockMode ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                  {mockMode ? 'Interactive Demo (Mock Mode)' : 'Real Backend REST & WebSocket'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Backend API URL (SQLite3 Backend):</span>
                <code className="text-indigo-300">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">WebSocket URL:</span>
                <code className="text-indigo-300">{import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'}</code>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 font-sans space-y-2">
              <h4 className="text-sm font-semibold text-slate-100">How to switch between Real Backend & Mock Mode:</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Update the <code className="text-indigo-400 font-mono">.env</code> file in the project root:
              </p>
              <pre className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-xs text-slate-200">
{`VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1`}
              </pre>
            </div>
          </div>
        </Card>

        <Card title="AI Engine Confidence Thresholds">
          <div className="space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Auto-Approval Confidence Limit</span>
                <span className="text-slate-400 font-sans">Actions with confidence &gt; 95% and LOW risk will auto-execute</span>
              </div>
              <span className="font-bold text-purple-400 text-sm">95%</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Human Approval Trigger</span>
                <span className="text-slate-400 font-sans">Actions with MEDIUM/HIGH risk mandate engineer approval</span>
              </div>
              <span className="font-bold text-amber-400 text-sm">MANDATORY</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
