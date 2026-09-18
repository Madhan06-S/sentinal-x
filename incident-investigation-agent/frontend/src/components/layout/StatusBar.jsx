import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wifi, WifiOff, Database, Cpu } from 'lucide-react';

export default function StatusBar() {
  const { systemStatus, isWsConnected, simulationState } = useApp();

  const isOnline = systemStatus.online;
  const dbUp = systemStatus.database === 'up';

  return (
    <footer className="bottom-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="status-indicator">
          <div className={`status-dot ${isOnline ? '' : 'offline'}`} />
          <span>API Backend: <strong>{isOnline ? 'Active (HTTP 200)' : 'Disconnected'}</strong></span>
        </div>

        <div className="status-indicator">
          <Database size={13} style={{ color: dbUp ? 'var(--status-green)' : 'var(--status-red)' }} />
          <span>DB: <strong>sentinelx.db ({dbUp ? 'SQLite Ready' : 'Down'})</strong></span>
        </div>

        <div className="status-indicator">
          {isWsConnected ? (
            <Wifi size={13} style={{ color: 'var(--status-green)' }} />
          ) : (
            <WifiOff size={13} style={{ color: 'var(--status-amber)' }} />
          )}
          <span>Realtime Stream: <strong>{isWsConnected ? 'WebSocket Connected' : 'Polling Fallback (3s)'}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {simulationState?.running && (
          <span className="badge badge-amber" style={{ animation: 'pulse 1.5s infinite' }}>
            <Cpu size={12} /> Scenario Executing: {simulationState.scenario}
          </span>
        )}
        <span>Environment: <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>{systemStatus.environment}</strong></span>
      </div>
    </footer>
  );
}
