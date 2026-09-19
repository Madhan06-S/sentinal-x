import React, { useState, useEffect } from 'react';
import { Search, Flame, Server, AlertTriangle, GitCommit, ArrowRight, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commandItems = [
    { id: 'inc-1', category: 'Incidents', title: 'INC-8942 · PostgreSQL Connection Pool Exhaustion', path: '/incidents', icon: Flame },
    { id: 'inc-2', category: 'Incidents', title: 'INC-8939 · Memory Leak on Order Service v2.4.1', path: '/incidents', icon: Flame },
    { id: 'srv-1', category: 'Services', title: 'payment-gateway (Health: 99.8% · 142ms p99)', path: '/services', icon: Server },
    { id: 'srv-2', category: 'Services', title: 'orders-service (Health: DEGRADED · 480ms p99)', path: '/services', icon: Server },
    { id: 'alt-1', category: 'Alerts', title: 'DB-104 · Max database connections reached on postgres-master', path: '/alerts', icon: AlertTriangle },
    { id: 'dep-1', category: 'Deployments', title: 'v2.4.1 · orders-service deployment by sarah.j', path: '/deployments', icon: GitCommit },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans text-xs animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-4 h-4 text-blue-600 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search incidents, services, alerts, deployments... (or press Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 font-sans focus:outline-none placeholder:text-slate-400"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate font-mono text-[11px]">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-500 uppercase">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No matching records found for "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white border border-slate-200 rounded px-1 text-slate-600">↑↓</kbd> navigate</span>
            <span><kbd className="bg-white border border-slate-200 rounded px-1 text-slate-600">↵</kbd> select</span>
            <span><kbd className="bg-white border border-slate-200 rounded px-1 text-slate-600">esc</kbd> close</span>
          </div>
          <span className="flex items-center gap-1 text-slate-500 font-bold">
            <Command className="w-3 h-3 text-blue-600" /> Sentinel-X Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};
