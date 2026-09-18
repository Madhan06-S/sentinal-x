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
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useIncidents } from '../../hooks/useIncidents';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { data: incidents } = useIncidents();

  const activeCount = incidents?.filter((i) => i.status !== 'RESOLVED').length || 0;

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Incidents', path: '/incidents', icon: Flame, badge: activeCount > 0 ? activeCount : undefined },
    { label: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Services', path: '/services', icon: Server },
    { label: 'Deployments', path: '/deployments', icon: GitCommit },
    { label: 'AI Analysis', path: '/incidents/INC-1042', icon: Sparkles, highlight: true },
    { label: 'Audit Logs', path: '/audit', icon: FileText },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 250 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex h-full flex-col border-r border-zinc-800/90 bg-zinc-950 px-3 py-4 z-30 shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="mb-6 flex items-center px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-[0_0_16px_rgba(99,102,241,0.4)] shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 flex flex-col min-w-0"
          >
            <span className="text-base font-bold tracking-tight text-white font-mono uppercase">
              AEGIS <span className="text-indigo-400 text-xs">v2.0</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-sans leading-none">Incident Command</span>
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
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold'
                    : item.highlight
                    ? 'text-purple-400 hover:bg-purple-950/40 hover:text-purple-300'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', item.highlight && 'text-purple-400 animate-pulse')} />
                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Active Indicator Pill */}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                  />
                )}

                {/* Badge */}
                {!collapsed && item.badge !== undefined && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-mono font-bold bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Controls */}
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-zinc-800">
        <NavLink to="/settings">
          {({ isActive }) => (
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
                isActive && 'bg-zinc-800 text-white'
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 flex h-8 w-full items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="text-xs font-mono">Collapse Sidebar</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
