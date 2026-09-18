import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Radio, AlertOctagon, History, PlayCircle, Zap } from 'lucide-react';

export default function Sidebar() {
  const { activePage, setActivePage, incidents, alerts } = useApp();

  const activeIncidentCount = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'FAILED'
  ).length;

  const awaitingApprovalCount = incidents.filter(
    (i) => i.status === 'AWAITING_APPROVAL'
  ).length;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo">
          <Zap size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-name">SENTINEL-X</div>
          <div className="brand-subtitle">Incident Resolution Engine</div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Operations Control</div>

        <div
          className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </div>

        <div
          className={`nav-item ${activePage === 'events' ? 'active' : ''}`}
          onClick={() => setActivePage('events')}
        >
          <Radio size={18} />
          <span>Live Events</span>
          {alerts.length > 0 && <span className="nav-badge">{alerts.length}</span>}
        </div>

        <div
          className={`nav-item ${activePage === 'incidents' || activePage === 'workspace' ? 'active' : ''}`}
          onClick={() => setActivePage('incidents')}
        >
          <AlertOctagon size={18} />
          <span>Incidents</span>
          {activeIncidentCount > 0 && (
            <span className={`nav-badge ${awaitingApprovalCount > 0 ? 'danger' : 'active'}`}>
              {activeIncidentCount}
            </span>
          )}
        </div>

        <div className="nav-section-title" style={{ marginTop: '12px' }}>Transparency & Testing</div>

        <div
          className={`nav-item ${activePage === 'audit' ? 'active' : ''}`}
          onClick={() => setActivePage('audit')}
        >
          <History size={18} />
          <span>Audit Trail</span>
        </div>

        <div
          className={`nav-item ${activePage === 'simulator' ? 'active' : ''}`}
          onClick={() => setActivePage('simulator')}
        >
          <PlayCircle size={18} />
          <span>Demo / Simulator</span>
        </div>
      </nav>
    </aside>
  );
}
