import React, { useState } from 'react';
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
import { WifiOff, X } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
      retry: 2,
    },
  },
});

const AppContent: React.FC = () => {
  const [isWsDisconnected, setIsWsDisconnected] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useRealtime((event) => {
    if (event.type === 'WS_DISCONNECTED') {
      setIsWsDisconnected(true);
      setBannerDismissed(false);
    } else if (event.type === 'WS_CONNECTED') {
      setIsWsDisconnected(false);
    }
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {isWsDisconnected && !bannerDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-[12px] font-mono text-amber-900 z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Connection lost — retrying...</span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 hover:bg-amber-100 rounded text-amber-700 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Topbar systemStatus={isWsDisconnected ? 'DEGRADED' : 'HEALTHY'} />

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
