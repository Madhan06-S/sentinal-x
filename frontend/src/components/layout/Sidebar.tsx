import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  Flame,
  Server,
  GitCommit,
  Sparkles,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useIncidents } from '../../hooks/useIncidents';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { data: incidents } = useIncidents();

  const activeCount = incidents?.filter((i) => i.status !== 'RESOLVED').length || 0;

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Architecture Spec', path: '/architecture', icon: Layers, highlight: true },
    { label: 'Incidents', path: '/incidents', icon: Flame, badge: activeCount > 0 ? activeCount : undefined },
    { label: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Services', path: '/services', icon: Server },
    { label: 'Deployments', path: '/deployments', icon: GitCommit },
    { label: 'Copilot Insights', path: '/ai-analysis', icon: Sparkles },
    { label: 'Audit Logs', path: '/audit', icon: FileText },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="relative flex h-full flex-col border-r border-[#E5E9F0] bg-white px-3 py-4 z-30 shrink-0 select-none shadow-xs font-sans"
    >
      {/* Brand Header */}
      <div className="mb-6 flex items-center px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-xs shrink-0 text-white">
          <Shield className="h-5 w-5" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 flex flex-col min-w-0"
          >
            <span className="text-sm font-extrabold tracking-wider text-slate-900 font-mono">
              SENTINEL-X
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight truncate">
              Autonomous Incident Resolution
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
          >
            {({ isActive }) => (
              <div
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-[#F1F4F9] text-blue-600 font-semibold border-r-2 border-blue-600'
                    : item.highlight
                    ? 'text-blue-700 hover:bg-blue-50/60'
                    : 'text-slate-600 hover:bg-[#F8FAFC] hover:text-slate-900'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-600' : item.highlight ? 'text-blue-600' : 'text-slate-500')} />
                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Badge */}
                {!collapsed && item.badge !== undefined && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-mono font-bold bg-red-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Controls */}
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#E5E9F0]">
        <NavLink to="/settings">
          {({ isActive }) => (
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors text-slate-600 hover:bg-[#F8FAFC] hover:text-slate-900',
                isActive && 'bg-[#F1F4F9] text-blue-600 font-semibold'
              )}
            >
              <Settings className="h-4 w-4 shrink-0 text-slate-500" />
              {!collapsed && <span>Settings</span>}
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 flex h-8 w-full items-center justify-center rounded-lg border border-[#E5E9F0] bg-[#F8FAFC] text-slate-600 hover:bg-[#F1F4F9] hover:text-slate-900 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-1.5 text-[12px] font-medium">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

