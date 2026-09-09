import React from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';

export function AppShell({ children, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoRoleSwitcher />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
