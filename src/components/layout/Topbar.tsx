import React, { useState } from 'react';
import { Play, Bell, Activity, Search, ChevronRight, Server } from 'lucide-react';
import { Button } from '../ui/Button';
import { AutonomyDial, AutonomyLevel } from './AutonomyDial';
import { startSimulation } from '../../api/simulation';
import { cn } from '../../lib/utils';

interface TopbarProps {
  systemStatus?: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  activeIncidentCount?: number;
  autonomyLevel?: AutonomyLevel;
  onChangeAutonomy?: (level: AutonomyLevel) => void;
  onRunDemoScript?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  systemStatus = 'CRITICAL',
  activeIncidentCount = 3,
  autonomyLevel = 3,
  onChangeAutonomy,
  onRunDemoScript,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleStartDemo = async () => {
    setIsSimulating(true);
    if (onRunDemoScript) {
      onRunDemoScript();
    } else {
      try {
        await startSimulation();
      } catch (e) {
        console.error('Failed to trigger simulation:', e);
      }
    }
    setTimeout(() => setIsSimulating(false), 3000);
  };

  const statusColors = {
    HEALTHY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    DEGRADED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/70 px-6 backdrop-blur-xl z-20 sticky top-0">
      {/* Left Breadcrumb & Context */}
      <div className="flex items-center gap-3 text-sm text-zinc-400 font-mono">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Server className="w-4 h-4 text-cyan-400" /> Production (us-east-1)
        </span>
        <ChevronRight className="h-4 w-4 text-zinc-600" />
        <span className="text-zinc-200 font-semibold font-sans">Aegis AI Command Center</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Command Palette Search */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:border-zinc-700 cursor-pointer transition-colors">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <span>Search incident, log or service...</span>
          <kbd className="ml-2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* System Health Badge */}
        <div className={cn('hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium', statusColors[systemStatus])}>
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>SYSTEM {systemStatus}</span>
        </div>

        {/* Feature 5: Autonomy Dial */}
        <AutonomyDial currentLevel={autonomyLevel} onChangeLevel={onChangeAutonomy} />

        {/* Live Simulation Script Button */}
        <Button
          variant="glow"
          size="sm"
          onClick={handleStartDemo}
          isLoading={isSimulating}
          icon={<Play className="w-3.5 h-3.5 fill-current" />}
        >
          Run Live Incident Demo
        </Button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {activeIncidentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800 mb-3 font-mono">
                <span className="text-xs font-semibold uppercase text-zinc-300">
                  Active Alerts ({activeIncidentCount})
                </span>
                <span className="text-[10px] text-cyan-400">Live Sync</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-red-950/40 border border-red-800/40 rounded-lg">
                  <p className="font-medium text-red-300">INC-1042: Payment degradation</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Database Connection Exhaustion</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white ring-2 ring-cyan-500/30 cursor-pointer">
          SJ
        </div>
      </div>
    </header>
  );
};
