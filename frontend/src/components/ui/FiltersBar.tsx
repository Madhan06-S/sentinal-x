import React from 'react';
import { Search, Download, Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AlertSeverity } from '../../types/alert';

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSeverities?: AlertSeverity[];
  onSeverityToggle?: (severity: AlertSeverity) => void;
  selectedStatus?: string[];
  onStatusToggle?: (status: string) => void;
  statusOptions?: string[];
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  onExport?: () => void;
  extraControls?: React.ReactNode;
}

const SEVERITIES: AlertSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const TIME_RANGES = ['Live', '1h', '6h', '24h', '7d'];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverities = [],
  onSeverityToggle,
  selectedStatus = [],
  onStatusToggle,
  statusOptions = [],
  timeRange = 'Live',
  onTimeRangeChange,
  onExport,
  extraControls,
}) => {
  return (
    <div className="bg-white border border-[#E5E9F0] rounded-[10px] shadow-card p-3 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ID, title, service, error code..."
          className="w-full pl-9 pr-8 py-2 text-[13px] bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Severity Multi-select Pills */}
        {onSeverityToggle && (
          <div className="flex items-center gap-1 bg-[#F1F4F9] p-1 rounded-lg border border-[#E5E9F0]">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {SEVERITIES.map((sev) => {
              const active = selectedSeverities.includes(sev);
              return (
                <button
                  key={sev}
                  onClick={() => onSeverityToggle(sev)}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all font-sans',
                    active
                      ? sev === 'CRITICAL'
                        ? 'bg-red-600 text-white shadow-sm'
                        : sev === 'HIGH'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : sev === 'MEDIUM'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  )}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        )}

        {/* Status Pills */}
        {onStatusToggle && statusOptions.length > 0 && (
          <div className="flex items-center gap-1 bg-[#F1F4F9] p-1 rounded-lg border border-[#E5E9F0] overflow-x-auto max-w-xs">
            {statusOptions.map((st) => {
              const active = selectedStatus.includes(st);
              return (
                <button
                  key={st}
                  onClick={() => onStatusToggle(st)}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-medium rounded-md whitespace-nowrap transition-all font-sans',
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  )}
                >
                  {st.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        )}

        {/* Time-range Pills */}
        {onTimeRangeChange && (
          <div className="flex items-center gap-1 bg-[#F1F4F9] p-1 rounded-lg border border-[#E5E9F0]">
            {TIME_RANGES.map((tr) => (
              <button
                key={tr}
                onClick={() => onTimeRangeChange(tr)}
                className={cn(
                  'px-2 py-0.5 text-[11px] font-medium rounded-md transition-all font-sans',
                  timeRange === tr
                    ? 'bg-white text-blue-600 font-semibold shadow-xs border border-[#E5E9F0]'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {tr}
              </button>
            ))}
          </div>
        )}

        {extraControls}

        {/* Export Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E9F0] hover:border-slate-300 text-slate-700 hover:text-slate-900 text-[12px] font-medium rounded-lg shadow-xs transition-all font-sans"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        )}
      </div>
    </div>
  );
};
