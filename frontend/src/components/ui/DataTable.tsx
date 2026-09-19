import React, { useState } from 'react';
import { Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  mono?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptySubtext?: string;
  renderExpandedRow?: (row: T) => React.ReactNode;
  isRowExpanded?: (row: T) => boolean;
  rowKey?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  pageSize = 10,
  emptyTitle = 'No data yet',
  emptySubtext = 'Telemetry signals or records will appear here as incidents progress.',
  renderExpandedRow,
  isRowExpanded,
  rowKey,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#E5E9F0] rounded-[10px] shadow-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Database className="w-6 h-6" />
        </div>
        <h4 className="text-[15px] font-semibold text-slate-900 font-sans">{emptyTitle}</h4>
        <p className="text-[13px] text-slate-500 max-w-sm mt-1 leading-relaxed font-sans">{emptySubtext}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-[10px] shadow-card overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#F1F4F9] border-b border-[#E5E9F0] sticky top-0 z-10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-sans',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E9F0]">
            {paginatedData.map((row, idx) => {
              const key = rowKey ? rowKey(row) : (row.id || row.incident_id || row.event_id || idx);
              const expanded = isRowExpanded ? isRowExpanded(row) : false;

              return (
                <React.Fragment key={key}>
                  <tr
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      'transition-colors duration-150',
                      onRowClick ? 'cursor-pointer hover:bg-[#F1F4F9]' : 'hover:bg-[#F8FAFC]'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3.5 text-slate-800 font-sans align-middle',
                          col.mono && 'font-mono text-slate-900 font-medium',
                          col.className
                        )}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                  {expanded && renderExpandedRow && (
                    <tr className="bg-[#F8FAFC]">
                      <td colSpan={columns.length} className="px-4 py-3 border-t border-b border-[#E5E9F0]">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > pageSize && (
        <div className="px-4 py-3 border-t border-[#E5E9F0] bg-[#F8FAFC] flex items-center justify-between text-[12px] text-slate-600 font-sans">
          <div>
            Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(startIndex + pageSize, data.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{data.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-[#E5E9F0] rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <span className="font-mono text-slate-700 font-semibold px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-[#E5E9F0] rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
