import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';

const data = [
  { name: 'Critical', value: 1, color: '#EF4444' },
  { name: 'High', value: 1, color: '#F59E0B' },
  { name: 'Medium', value: 1, color: '#3B82F6' },
  { name: 'Low', value: 0, color: '#64748B' },
];

export const SeverityDistributionChart: React.FC = () => {
  return (
    <Card title="Severity Distribution" subtitle="Active incidents broken down by severity">
      <div className="h-64 w-full flex items-center justify-between">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 space-y-3 font-mono text-xs">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <span className="font-bold text-slate-100">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
