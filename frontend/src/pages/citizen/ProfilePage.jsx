import React from 'react';
import { CitizenLayout } from '../../components/layout/CitizenLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ProfilePage() {
  const { user, switchDemoRole } = useAuth();

  return (
    <CitizenLayout>
      <div className="max-w-2xl space-y-6">
        <div className="pb-2 border-b border-slate-200/60 dark:border-midnight-800">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account & Profile Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your citizen profile information and platform credentials</p>
        </div>

        <div className="bg-white dark:bg-midnight-850/90 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl backdrop-blur-xl space-y-6 transition-all">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-midnight-800">
            <img
              src={user?.avatarUrl}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm ring-4 ring-brand-500/10"
            />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/80 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800/60">
                {user?.role} ACCOUNT
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50/90 dark:bg-midnight-900/80 rounded-xl border border-slate-200/80 dark:border-midnight-700/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Demo Account Role Switcher</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly switch active role to test City Administrator views or Public Citizen features.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => switchDemoRole('CITIZEN')} variant="outline" size="sm">
                  Set to Citizen Jane
                </Button>
                <Button onClick={() => switchDemoRole('ADMIN')} variant="primary" size="sm">
                  Set to Admin Alex
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
