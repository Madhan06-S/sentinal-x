import React from 'react';
import { Card } from '../ui/Card';
import { useIncidents } from '../../hooks/useIncidents';

export const SeverityDistributionChart: React.FC = () => {
  const { data: incidents } = useIncidents();

  const total = incidents?.length || 0;
  const critical = incidents?.filter((i) => i.severity === 'CRITICAL').length || 0;
  const high = incidents?.filter((i) => i.severity === 'HIGH').length || 0;
  const medium = incidents?.filter((i) => i.severity === 'MEDIUM').length || 0;
  const low = incidents?.filter((i) => i.severity === 'LOW').length || 0;

  const rawItems = [
    { name: 'Critical', count: critical, color: 'bg-red-600', textColor: 'text-red-600', badgeBg: 'bg-red-50 border-red-200' },
    { name: 'High', count: high, color: 'bg-amber-600', textColor: 'text-amber-600', badgeBg: 'bg-amber-50 border-amber-200' },
    { name: 'Medium', count: medium, color: 'bg-blue-600', textColor: 'text-blue-600', badgeBg: 'bg-blue-50 border-blue-200' },
    { name: 'Low', count: low, color: 'bg-emerald-600', textColor: 'text-emerald-600', badgeBg: 'bg-emerald-50 border-emerald-200' },
  ];

  const items = rawItems
    .map((item) => ({
      ...item,
      percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0,
    }))
    .filter((item) => item.count > 0);

  return (
    <Card title="Incident Severity Breakdown" subtitle={`Distribution across ${total} total incident${total === 1 ? '' : 's'}`}>
      <div className="space-y-4 pt-2 font-sans">
        {total === 0 ? (
          <div className="py-8 text-center text-[13px] text-slate-500">No active or recorded incidents</div>
        ) : (
          <>
            {/* Horizontal Stacked Bar */}
            <div className="w-full bg-[#F1F4F9] h-3 rounded-full overflow-hidden flex border border-[#E5E9F0]">
              {items.map((item) => (
                <div
                  key={item.name}
                  className={`${item.color} h-full transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.name}: ${item.count} (${item.percentage}%)`}
                />
              ))}
            </div>

            {/* Counts List - Hide empty rows */}
            <div className="space-y-2 pt-1">
              {items.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E9F0]">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">{item.percentage}%</span>
                    <span className={`text-[12px] font-mono font-semibold px-2 py-0.5 rounded border ${item.badgeBg} ${item.textColor}`}>
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
