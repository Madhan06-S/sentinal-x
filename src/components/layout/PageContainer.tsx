import React from 'react';
import { PageHeader } from '../ui/PageHeader';

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
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in font-sans">
      <PageHeader title={title} description={description}>
        {action}
      </PageHeader>
      <div>{children}</div>
    </div>
  );
};
