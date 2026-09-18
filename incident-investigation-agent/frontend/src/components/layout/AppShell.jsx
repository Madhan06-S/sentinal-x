import React from 'react';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import ErrorBanner from '../common/ErrorBanner';
import { Play, ShieldAlert, RefreshCw } from 'lucide-react';

export default function AppShell({ children }) {
  const { activePage, setActivePage, error, setError, triggerSimulator, loading, refreshIncidents } = useApp();

  const pageTitles = {
    dashboard: 'Executive Operations Dashboard',
    events: 'Live Event & Telemetry Stream',
    incidents: 'Active Incidents Directory',
    workspace: 'Incident Investigation Command Center',
    audit: 'System Audit Trail Log',
    simulator: 'Demo Scenario Controls & Simulator',
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="header-bar">
          <div className="page-title">
            <span>{pageTitles[activePage] || 'Command Center'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                triggerSimulator('cascade');
                setActivePage('workspace');
              }}
              disabled={loading.simulator}
            >
              <Play size={14} /> Scenario 1: Payment Cascade
            </button>

            <button
              className="btn btn-warning"
              onClick={() => {
                triggerSimulator('insufficient_evidence');
                setActivePage('workspace');
              }}
              disabled={loading.simulator}
            >
              <ShieldAlert size={14} /> Scenario 2: Unknown Cause
            </button>

            <button
              className="btn btn-secondary"
              onClick={refreshIncidents}
              title="Refresh Data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="page-content">
          <ErrorBanner message={error} onClose={() => setError(null)} />
          {children}
        </main>

        <StatusBar />
      </div>
    </div>
  );
}
