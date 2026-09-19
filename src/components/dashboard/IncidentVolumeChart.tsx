import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line } from 'recharts';
import { Card } from '../ui/Card';

const data = [
  { time: '12:00', alerts: 12, errorRate: 0.1 },
  { time: '12:10', alerts: 8, errorRate: 0.1 },
  { time: '12:20', alerts: 15, errorRate: 0.3 },
  { time: '12:30', alerts: 24, errorRate: 1.2 },
  { time: '12:40', alerts: 47, errorRate: 4.8 },
  { time: '12:42', alerts: 32, errorRate: 3.1 },
  { time: '12:45', alerts: 18, errorRate: 1.0 },
  { time: '12:50', alerts: 9, errorRate: 0.2 },
];

export const IncidentVolumeChart: React.FC = () => {
  return (
    <Card title="Telemetry Stream & SLA Metrics" subtitle="Real-time alert volume and error rate trends">
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="alertGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F7" vertical={false} />
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E9F0',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#0F172A',
                boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
              }}
            />
            <Area
              type="monotone"
              dataKey="alerts"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#alertGradLight)"
              name="Alert Volume (events/min)"
            />
            <Line
              type="monotone"
              dataKey="errorRate"
              stroke="#475569"
              strokeWidth={2}
              dot={{ r: 3, fill: '#475569' }}
              name="Error Rate (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
