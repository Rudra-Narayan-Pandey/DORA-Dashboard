import React from 'react';
import PageTransition from '../effects/PageTransition';

export const PageContainer = ({ children }) => {
  return (
    <main className="ml-64 pt-24 px-container-padding pb-20 min-h-screen text-on-surface">
      <PageTransition>
        <div className="w-full flex flex-col gap-6">
          {children}
        </div>
      </PageTransition>
    </main>
  );
};
export default PageContainer;
