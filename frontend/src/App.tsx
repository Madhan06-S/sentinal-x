import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/ToastContainer';
import { OverviewPage } from './pages/OverviewPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { ServicesPage } from './pages/ServicesPage';
import { DeploymentsPage } from './pages/DeploymentsPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useRealtime } from './hooks/useRealtime';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
      retry: 2,
    },
  },
});

const AppContent: React.FC = () => {
  // Activate real-time listener for automated query invalidations & toasts
  useRealtime();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Topbar systemStatus="HEALTHY" activeIncidentCount={0} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA]">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/deployments" element={<DeploymentsPage />} />
            <Route path="/ai-analysis" element={<AIAnalysisPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
