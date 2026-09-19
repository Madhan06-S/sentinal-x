import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E9F0]">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-900 tracking-tight font-sans">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-slate-600 mt-0.5 font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
};
