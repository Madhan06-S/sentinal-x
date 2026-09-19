import React from 'react';
import { Card } from '../ui/Card';
import { useIncidents } from '../../hooks/useIncidents';

export const SeverityDistributionChart: React.FC = () => {
  const { data: incidents } = useIncidents();

  const total = incidents?.length || 1;
  const critical = incidents?.filter((i) => i.severity === 'CRITICAL').length || 1;
  const high = incidents?.filter((i) => i.severity === 'HIGH').length || 1;
  const medium = incidents?.filter((i) => i.severity === 'MEDIUM').length || 1;
  const low = incidents?.filter((i) => i.severity === 'LOW').length || 0;

  const items = [
    { name: 'Critical', count: critical, color: 'bg-red-600', textColor: 'text-red-600', percentage: Math.round((critical / total) * 100) },
    { name: 'High', count: high, color: 'bg-amber-600', textColor: 'text-amber-600', percentage: Math.round((high / total) * 100) },
    { name: 'Medium', count: medium, color: 'bg-blue-600', textColor: 'text-blue-600', percentage: Math.round((medium / total) * 100) },
    { name: 'Low', count: low, color: 'bg-emerald-600', textColor: 'text-emerald-600', percentage: Math.round((low / total) * 100) },
  ];

  return (
    <Card title="Incident Severity Breakdown" subtitle="Distribution across severity thresholds">
      <div className="space-y-4 pt-2">
        {/* Horizontal Stacked Bar */}
        <div className="w-full bg-[#F1F4F9] h-3.5 rounded-full overflow-hidden flex shadow-inner border border-[#E5E9F0]">
          {items.map(
            (item) =>
              item.percentage > 0 && (
                <div
                  key={item.name}
                  className={`${item.color} h-full transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.name}: ${item.count} (${item.percentage}%)`}
                />
              )
          )}
        </div>

        {/* Counts List */}
        <div className="space-y-2.5 pt-2">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E9F0]">
              <div className="flex items-center gap-2 text-[13px] font-sans">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="font-semibold text-slate-900">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-mono text-slate-500 font-medium">{item.percentage}%</span>
                <span className={`text-[14px] font-bold font-mono ${item.textColor}`}>{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
