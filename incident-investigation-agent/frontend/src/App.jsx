import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import DashboardView from './components/dashboard/DashboardView';
import LiveEventStream from './components/events/LiveEventStream';
import IncidentList from './components/incidents/IncidentList';
import IncidentWorkspace from './components/workspace/IncidentWorkspace';
import AuditTrailView from './components/audit/AuditTrailView';
import DemoSimulatorView from './components/simulator/DemoSimulatorView';

function NavigationRouter() {
  const { activePage } = useApp();

  switch (activePage) {
    case 'dashboard':
      return <DashboardView />;
    case 'events':
      return <LiveEventStream />;
    case 'incidents':
      return <IncidentList />;
    case 'workspace':
      return <IncidentWorkspace />;
    case 'audit':
      return <AuditTrailView />;
    case 'simulator':
      return <DemoSimulatorView />;
    default:
      return <DashboardView />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <NavigationRouter />
      </AppShell>
    </AppProvider>
  );
}
