import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';

const data = [
  { time: '12:00', incidents: 1, alerts: 12 },
  { time: '12:10', incidents: 0, alerts: 8 },
  { time: '12:20', incidents: 1, alerts: 15 },
  { time: '12:30', incidents: 2, alerts: 24 },
  { time: '12:40', incidents: 4, alerts: 47 },
  { time: '12:42', incidents: 3, alerts: 32 },
  { time: '12:45', incidents: 1, alerts: 18 },
];

export const IncidentVolumeChart: React.FC = () => {
  return (
    <Card title="Incident & Telemetry Volume" subtitle="Real-time incident & alert activity timeline">
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#1E293B',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
            <Area
              type="monotone"
              dataKey="alerts"
              stroke="#6366F1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#alertGrad)"
              name="Alerts / min"
            />
            <Area
              type="monotone"
              dataKey="incidents"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#incGrad)"
              name="Incidents"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
