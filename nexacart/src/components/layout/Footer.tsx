import React from 'react';
import { ShoppingBag, ShieldCheck, Terminal, HeartHandshake, Zap } from 'lucide-react';
import { getIncidentEngineUrl } from '../../api/client';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const engineUrl = getIncidentEngineUrl();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">NexaCart</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Simple shopping. Secure payments. High-availability e-commerce infrastructure monitored 24/7 by the Autonomous Enterprise Incident Resolution Engine.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PCI-DSS Level 1 & SOC-2 Type II Certified</span>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Shop Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('products')} className="hover:text-indigo-600">Laptops & Workstations</button></li>
              <li><button onClick={() => onNavigate('products')} className="hover:text-indigo-600">Studio Audio & ANC</button></li>
              <li><button onClick={() => onNavigate('products')} className="hover:text-indigo-600">Smartphones & Wearables</button></li>
              <li><button onClick={() => onNavigate('products')} className="hover:text-indigo-600">Ultra-wide 4K Displays</button></li>
            </ul>
          </div>

          {/* Enterprise & Security */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Enterprise Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-600">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Microservices Architecture</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero-downtime Rollback Hooks</span>
              </li>
              <li className="text-slate-500 font-mono text-[11px] pt-1">
                Engine: <span className="text-slate-700">{engineUrl}</span>
              </li>
            </ul>
          </div>

          {/* Developer / Telemetry Sandbox */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Incident Engineering</h4>
            <p className="text-xs text-slate-500 mb-3">
              This application is monitored by Autonomous Incident Resolution Engine.
            </p>
            <button
              onClick={() => onNavigate('demo')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono transition-colors shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Launch /demo Simulator</span>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NexaCart Global Commerce Technologies, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>GET /health</span>
            <span>GET /api/health</span>
            <span>POST /api/remediation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
