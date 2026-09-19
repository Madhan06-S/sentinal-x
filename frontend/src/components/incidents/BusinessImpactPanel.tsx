import React from 'react';
import { Card } from '../ui/Card';
import { BusinessImpact } from '../../types/incident';
import { TrendingDown, AlertTriangle, Layers, DollarSign, ArrowRight } from 'lucide-react';
import { SeverityBadge } from '../ui/Badge';

interface BusinessImpactPanelProps {
  impact?: BusinessImpact;
}

export const BusinessImpactPanel: React.FC<BusinessImpactPanelProps> = ({ impact }) => {
  if (!impact) return null;

  const flowItems = ['Database Core', 'Payment API', 'Checkout Engine', 'Customer Transactions'];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <span className="text-base font-bold text-slate-100">Business & Infrastructure Impact</span>
        </div>
      }
      subtitle="Cascade topology & financial risk assessment"
    >
      <div className="space-y-6">
        {/* Cascade Flow Line */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Impact Propagation Pathway
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            {flowItems.map((item, idx) => (
              <React.Fragment key={item}>
                <div className="px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-lg text-slate-200 font-medium">
                  {item}
                </div>
                {idx < flowItems.length - 1 && <ArrowRight className="w-4 h-4 text-red-500 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 font-mono">
            <span className="text-slate-400 text-xs block">Transaction Failure Rate</span>
            <span className="text-xl font-bold text-red-400">{impact.estimated_tx_failure_rate}</span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 font-mono">
            <span className="text-slate-400 text-xs block">Customer Experience</span>
            <div className="pt-0.5">
              <SeverityBadge severity={impact.customer_impact} size="sm" />
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 font-mono">
            <span className="text-slate-400 text-xs block">Est. Revenue at Risk</span>
            <span className="text-xl font-bold text-amber-400 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {impact.estimated_financial_risk_usd.toLocaleString()}/hr
            </span>
          </div>
        </div>

        {/* Affected Capabilities list */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Impacted Business Capabilities
          </span>
          <div className="flex flex-wrap gap-2">
            {impact.affected_capabilities.map((cap) => (
              <span
                key={cap}
                className="px-3 py-1 bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300 rounded-lg"
              >
                ⚠ {cap}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
