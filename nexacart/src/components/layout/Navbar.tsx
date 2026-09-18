import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Terminal } from 'lucide-react';
import { useIncidentSimulation } from '../../hooks/useIncidentSimulation';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, cartCount }) => {
  const { status } = useIncidentSimulation();

  const getStatusIndicator = () => {
    switch (status) {
      case 'HEALTHY':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          text: 'Operational',
        };
      case 'DEGRADED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-ping',
          text: 'Degraded',
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500 animate-pulse',
          text: 'Critical Incident',
        };
      case 'RECOVERING':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500 animate-bounce',
          text: 'Recovering',
        };
    }
  };

  const statusConfig = getStatusIndicator();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-subtle">
      {/* Discreet System Notification Banner (if degraded/critical) */}
      {status !== 'HEALTHY' && (
        <div
          onClick={() => onNavigate('demo')}
          className="cursor-pointer bg-slate-900 text-white text-xs py-1.5 px-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'CRITICAL' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-medium">
              Operational Telemetry Active: {status} State Simulated
            </span>
            <span className="text-slate-400 hidden sm:inline">
              (Autonomous Incident Engine receiving telemetry via /api/events)
            </span>
            <span className="ml-auto underline text-indigo-300 hover:text-indigo-200 flex items-center gap-1 font-mono">
              <Terminal className="w-3.5 h-3.5" /> View /demo
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-8">
            <div
              onClick={() => onNavigate('home')}
              className="cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    NexaCart
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" /> Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide -mt-0.5 hidden sm:block">
                  Simple shopping. Secure payments.
                </p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'home'
                    ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('products')}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'products'
                    ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Products
              </button>
            </nav>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search laptops, audio, accessories..."
                onClick={() => onNavigate('products')}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Developer / Demo Simulator Button */}
            <button
              onClick={() => onNavigate('demo')}
              title="Open Incident Simulation Control Panel"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all ${statusConfig.bg} hover:shadow-sm`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              <span className="font-semibold">{statusConfig.text}</span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">| /demo</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm animate-in fade-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
