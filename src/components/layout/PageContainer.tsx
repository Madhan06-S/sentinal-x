import React from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  action,
  children,
}) => {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
          {description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
};
