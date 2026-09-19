import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Brush,
} from 'recharts';
import { Card } from '../ui/Card';

const telemetryData = [
  { time: '12:00', alertVolume: 14, p95Latency: 142, errorRate: 0.12 },
  { time: '12:05', alertVolume: 18, p95Latency: 155, errorRate: 0.15 },
  { time: '12:10', alertVolume: 22, p95Latency: 180, errorRate: 0.28 },
  { time: '12:15', alertVolume: 35, p95Latency: 240, errorRate: 0.85 },
  { time: '12:20', alertVolume: 64, p95Latency: 520, errorRate: 2.40 },
  { time: '12:25', alertVolume: 92, p95Latency: 980, errorRate: 5.10 },
  { time: '12:30', alertVolume: 118, p95Latency: 1450, errorRate: 8.90 },
  { time: '12:35', alertVolume: 85, p95Latency: 1120, errorRate: 6.20 },
  { time: '12:40', alertVolume: 48, p95Latency: 640, errorRate: 3.10 },
  { time: '12:45', alertVolume: 32, p95Latency: 380, errorRate: 1.40 },
  { time: '12:50', alertVolume: 21, p95Latency: 210, errorRate: 0.45 },
  { time: '12:55', alertVolume: 16, p95Latency: 165, errorRate: 0.18 },
];

export const IncidentVolumeChart: React.FC = () => {
  const [visibleSeries, setVisibleSeries] = useState({
    alertVolume: true,
    p95Latency: true,
    errorRate: true,
  });

  const toggleSeries = (dataKey: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <Card
      title="Telemetry Stream & SLA Metrics"
      subtitle="Correlated alert volume (bars), p95 latency (ms), and error rate (%)"
      action={
        <div className="flex items-center gap-2 text-[11px] font-sans">
          <button
            onClick={() => toggleSeries('alertVolume')}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              visibleSeries.alertVolume
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            Alerts
          </button>
          <button
            onClick={() => toggleSeries('p95Latency')}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              visibleSeries.p95Latency
                ? 'bg-amber-50 border-amber-200 text-amber-700 font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
            p95 Latency
          </button>
          <button
            onClick={() => toggleSeries('errorRate')}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              visibleSeries.errorRate
                ? 'bg-red-50 border-red-200 text-red-700 font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            Error Rate
          </button>
        </div>
      }
    >
      <div className="h-72 w-full pt-2 font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={telemetryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F7" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontFamily="monospace"
            />
            <YAxis
              yAxisId="left"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontFamily="monospace"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontFamily="monospace"
              unit="ms"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E9F0',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#0F172A',
                boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
              }}
              formatter={(val: any, name: string) => {
                if (name === 'p95Latency') return [`${val} ms`, 'p95 Latency'];
                if (name === 'errorRate') return [`${val}%`, 'Error Rate'];
                return [`${val} events/min`, 'Alert Volume'];
              }}
            />
            {visibleSeries.alertVolume && (
              <Bar
                yAxisId="left"
                dataKey="alertVolume"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                barSize={16}
                name="alertVolume"
              />
            )}
            {visibleSeries.errorRate && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="errorRate"
                stroke="#DC2626"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#errorGrad)"
                name="errorRate"
              />
            )}
            {visibleSeries.p95Latency && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="p95Latency"
                stroke="#D97706"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#D97706' }}
                name="p95Latency"
              />
            )}
            <Brush dataKey="time" height={20} stroke="#CBD5E1" fill="#F8FAFC" startIndex={0} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
