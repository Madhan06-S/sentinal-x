import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ConfidenceSparklineProps {
  confidenceData?: number[];
  finalConfidence?: number;
}

export const ConfidenceSparkline: React.FC<ConfidenceSparklineProps> = ({
  confidenceData = [20, 35, 64, 82, 94],
  finalConfidence = 94,
}) => {
  const chartData = confidenceData.map((val, idx) => ({ step: idx, confidence: val }));

  return (
    <div className="flex items-center gap-3 p-2 bg-zinc-950/80 rounded-lg border border-zinc-800">
      <div className="flex-1 h-9">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="#22D3EE"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#confGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="shrink-0 text-right font-mono">
        <span className="text-[10px] text-zinc-400 block leading-none">Confidence</span>
        <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
          {finalConfidence}%
        </span>
      </div>
    </div>
  );
};
