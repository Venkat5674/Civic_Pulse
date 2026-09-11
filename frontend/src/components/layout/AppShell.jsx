import React from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { LocationPromptModal } from '../modals/LocationPromptModal';

export function AppShell({ children, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f4fe] dark:bg-[#080612] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      <LocationPromptModal />
    </div>
  );
}
