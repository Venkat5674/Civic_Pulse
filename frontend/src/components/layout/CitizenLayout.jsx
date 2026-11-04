import React from 'react';
import { AppShell } from './AppShell';
import { Sidebar } from './Sidebar';

export function CitizenLayout({ children }) {
  return (
    <AppShell showFooter={false}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </AppShell>
  );
}
