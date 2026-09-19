import React, { useState, useEffect } from 'react';
import {
  Bell,
  Activity,
  Search,
  ChevronDown,
  FlaskConical,
  ShieldCheck,
  User,
  Key,
  Settings,
  LogOut,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { startSimulation } from '../../api/simulation';
import { cn } from '../../lib/utils';
import { useIncidents } from '../../hooks/useIncidents';
import { useAutonomy } from '../../hooks/useAutonomy';
import { CommandPalette } from '../ui/CommandPalette';
import { Modal } from '../ui/Modal';
import { useNavigate } from 'react-router-dom';
import { AutonomyLevelKey } from '../../services/autonomy';

import { realtimeService, ConnectionStatus } from '../../services/realtime';

interface TopbarProps {
  systemStatus?: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export const Topbar: React.FC<TopbarProps> = ({ systemStatus = 'HEALTHY' }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showAutonomyMenu, setShowAutonomyMenu] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>(realtimeService.status);

  useEffect(() => {
    const unsub = realtimeService.subscribeStatus((st) => setWsStatus(st));
    return () => {
      unsub();
    };
  }, []);

  const { autonomyLevel, setAutonomyLevel } = useAutonomy();
  const { data: incidents } = useIncidents();
  const navigate = useNavigate();

  const activeIncidents = incidents?.filter((i) => i.status !== 'RESOLVED') || [];
  const activeCount = activeIncidents.length;
  const approvalsNeeded = incidents?.filter((i) => i.status === 'AWAITING_APPROVAL') || [];

  const canonicalLabels: Record<AutonomyLevelKey, string> = {
    L1: 'L1: Advisory',
    L2: 'L2: Guarded',
    L3: 'L3: Semi-Auto',
    L4: 'L4: Full-Auto',
  };

  // Global ⌘K keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTriggerFailureInjection = async () => {
    setIsSimulating(true);
    try {
      await startSimulation();
      setIsFailureModalOpen(false);
    } catch (e) {
      console.error('Failed to inject controlled failure:', e);
    } finally {
      setTimeout(() => setIsSimulating(false), 1500);
    }
  };

  const handleSelectAutonomy = async (lvl: AutonomyLevelKey) => {
    try {
      await setAutonomyLevel(lvl);
      setShowAutonomyMenu(false);
    } catch (err) {
      console.error('Failed to update autonomy level:', err);
    }
  };

  const statusColors = {
    HEALTHY: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    DEGRADED: 'bg-amber-50 text-amber-800 border-amber-200',
    CRITICAL: 'bg-red-50 text-red-800 border-red-200',
  };

  const currentStatus = activeCount > 0 ? 'DEGRADED' : systemStatus;

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-[#E5E9F0] bg-white px-5 z-30 sticky top-0 font-sans shadow-2xs select-none">
        {/* LEFT: Workspace Switcher & Environment Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-900 transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>acme-corp</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in duration-100 font-sans text-xs text-slate-700">
                <div className="px-2.5 py-1.5 text-[10px] font-mono text-slate-400 font-semibold uppercase">Switch Workspace</div>
                <button className="w-full text-left px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold flex items-center justify-between">
                  <span>acme-corp (Prod)</span>
                </button>
                <button className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium">
                  acme-staging
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => { navigate('/settings'); setShowWorkspaceMenu(false); }} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> Workspace Settings
                </button>
              </div>
            )}
          </div>

          <span className="text-slate-300 font-light">/</span>

          {/* Environment Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Production</span>
            <span className="text-slate-400">· us-east-1</span>
          </div>
        </div>

        {/* CENTER: ⌘K Power Command Palette Search */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/60 cursor-pointer transition-all shadow-xs w-96 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-sans text-slate-500">Search incidents, services, alerts...</span>
          </div>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 font-mono font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* RIGHT: Actions, System Health, Autonomy, Notifications, User */}
        <div className="flex items-center gap-2.5">
          {/* Datadog-style System Health Pill */}
          <div className={cn('hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-semibold', statusColors[currentStatus])}>
            <Activity className="w-3.5 h-3.5" />
            <span>SYSTEM {currentStatus}</span>
          </div>

          {/* WebSocket Connection Status Badge */}
          <div className={cn(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-semibold',
            wsStatus === 'LIVE'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : wsStatus === 'RECONNECTING'
              ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
              : 'bg-red-50 text-red-800 border-red-200'
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full',
              wsStatus === 'LIVE' ? 'bg-emerald-500' : wsStatus === 'RECONNECTING' ? 'bg-amber-500' : 'bg-red-500'
            )} />
            <span>WS: {wsStatus}</span>
          </div>

          {/* Shared Autonomy Level Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAutonomyMenu(!showAutonomyMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Autonomy: {autonomyLevel}</span>
              <ChevronDown className="w-3 h-3 text-blue-500" />
            </button>

            {showAutonomyMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in duration-100 font-sans text-xs">
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Autonomy Policy Level</div>
                {(['L1', 'L2', 'L3', 'L4'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleSelectAutonomy(lvl)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] my-0.5 transition-all cursor-pointer',
                      autonomyLevel === lvl
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <span>{canonicalLabels[lvl]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Failure Injection Button */}
          <button
            onClick={() => setIsFailureModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans border border-red-200 bg-red-50/50 hover:bg-red-100/80 text-red-700 transition-colors cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-red-600" />
            <span className="font-semibold">Failure Injection</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-1.5 hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 border border-slate-200 bg-white cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in duration-150 font-sans">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" /> System Activity
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">Live Sync</span>
                </div>

                <div className="space-y-3 text-xs">
                  {approvalsNeeded.length > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                      <span className="font-mono text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Action Approval Needed
                      </span>
                      <p className="text-[11px] text-amber-900 line-clamp-1">{approvalsNeeded[0].title}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
                      Active Incidents ({activeCount})
                    </span>
                    {activeIncidents.length === 0 ? (
                      <p className="text-slate-500 py-2 text-center text-xs">No active incidents</p>
                    ) : (
                      activeIncidents.slice(0, 3).map((inc) => (
                        <div
                          key={inc.incident_id}
                          onClick={() => { navigate('/incidents'); setShowNotifications(false); }}
                          className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 mb-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-600 text-[11px]">{inc.incident_id}</span>
                            <span className="text-[10px] text-slate-400">{inc.severity}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 line-clamp-1">{inc.title}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Dropdown Menu */}
          <div className="relative">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-8 w-8 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center font-bold font-mono text-[11px] text-white shadow-xs cursor-pointer transition-colors border border-slate-700"
            >
              SJ
            </div>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150 font-sans text-xs text-slate-700">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">Sarah Jenkins</p>
                  <p className="text-[11px] text-slate-500 font-mono">sarah.j@acme.corp</p>
                </div>
                <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Profile & Credentials
                </button>
                <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-slate-400" /> API Tokens
                </button>
                <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Engine Settings
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => setShowUserMenu(false)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium">
                  <LogOut className="w-3.5 h-3.5 text-red-500" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

      {/* Failure Injection Modal */}
      <Modal
        isOpen={isFailureModalOpen}
        onClose={() => setIsFailureModalOpen(false)}
        title="Inject controlled failure"
      >
        <div className="space-y-4 font-sans text-xs text-slate-700">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 space-y-1">
            <span className="font-bold font-mono text-[11px] block flex items-center gap-1">
              <FlaskConical className="w-4 h-4 text-red-600" /> Chaos Engineering Test Request
            </span>
            <p className="text-[11px] leading-relaxed">
              Inject controlled faulty deployment <code className="font-mono font-bold text-red-900 bg-red-100 px-1 rounded">v2.4.1</code> into target payment microservice topology.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono text-[11px] leading-relaxed">
            ⚠ <strong>Disclaimer:</strong> Simulated environment — no production impact. This test triggers the full Sentinel-X incident detection, RAG retrieval, and AI policy engine pipeline.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="ghost" size="sm" onClick={() => setIsFailureModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleTriggerFailureInjection}
              isLoading={isSimulating}
              icon={FlaskConical}
            >
              Inject Failure
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
