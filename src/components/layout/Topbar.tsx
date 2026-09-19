import React, { useState } from 'react';
import { Play, Bell, Activity, Search, ChevronRight, Server, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { startSimulation } from '../../api/simulation';
import { cn } from '../../lib/utils';
import { useIncidents } from '../../hooks/useIncidents';

interface TopbarProps {
  systemStatus?: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  activeIncidentCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  systemStatus = 'HEALTHY',
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: incidents } = useIncidents();

  const activeIncidents = incidents?.filter((i) => i.status !== 'RESOLVED') || [];
  const activeCount = activeIncidents.length;

  const handleStartDemo = async () => {
    setIsSimulating(true);
    try {
      await startSimulation();
    } catch (e) {
      console.error('Failed to trigger simulation:', e);
    } finally {
      setTimeout(() => setIsSimulating(false), 2000);
    }
  };

  const statusColors = {
    HEALTHY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DEGRADED: 'bg-amber-50 text-amber-700 border-amber-200',
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  };

  const currentStatus = activeCount > 0 ? 'DEGRADED' : systemStatus;

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E5E9F0] bg-white px-6 z-20 sticky top-0 font-sans shadow-xs">
      {/* Left Breadcrumb & Context */}
      <div className="flex items-center gap-2.5 text-[13px] text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-700 font-medium font-mono text-[12px]">
          <Server className="w-3.5 h-3.5 text-blue-600" /> Production us-east-1
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-slate-900 font-semibold font-sans">Aegis AI Command Center</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Command Palette Search */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-[#E5E9F0] bg-[#F8FAFC] px-3 py-1.5 text-[12px] font-sans text-slate-500 hover:border-slate-300 cursor-pointer transition-colors shadow-xs">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Search incident, telemetry or service...</span>
          <kbd className="ml-3 rounded border border-[#E5E9F0] bg-white px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* System Health Badge */}
        <div className={cn('hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono font-semibold', statusColors[currentStatus])}>
          <Activity className="w-3.5 h-3.5" />
          <span>SYSTEM {currentStatus}</span>
        </div>

        {/* Autonomy Dial Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[11px] font-medium font-sans">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>L3 Semi-Autonomous</span>
        </div>

        {/* Live Simulation / Chaos Console Button */}
        <Button
          variant="danger"
          size="sm"
          onClick={handleStartDemo}
          isLoading={isSimulating}
          icon={<Zap className="w-3.5 h-3.5 fill-current" />}
        >
          Run Live Incident Demo
        </Button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 hover:bg-[#F1F4F9] transition-colors text-slate-600 hover:text-slate-900 border border-transparent hover:border-[#E5E9F0]"
          >
            <Bell className="h-4.5 w-4.5" />
            {activeCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E9F0] rounded-[10px] shadow-dropdown p-4 z-50 animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-[#E5E9F0] mb-3 font-sans">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                  Active Incidents ({activeCount})
                </span>
                <span className="text-[11px] text-blue-600 font-mono font-medium">Live Sync</span>
              </div>
              <div className="space-y-2 text-[12px]">
                {activeIncidents.length === 0 ? (
                  <p className="text-slate-500 py-2 text-center">No active incidents</p>
                ) : (
                  activeIncidents.slice(0, 3).map((inc) => (
                    <div key={inc.incident_id} className="p-2.5 bg-red-50/60 border border-red-200/80 rounded-lg">
                      <p className="font-semibold text-slate-900 font-mono">{inc.incident_id}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{inc.title}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[12px] text-white shadow-xs cursor-pointer">
          SRE
        </div>
      </div>
    </header>
  );
};
