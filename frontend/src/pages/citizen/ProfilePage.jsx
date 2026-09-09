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
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Account & Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your citizen profile information and platform credentials</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <img
              src={user?.avatarUrl}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
            />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                {user?.role} ACCOUNT
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Shield className="w-4 h-4 text-brand-600" />
                <span>Demo Account Role Switcher</span>
              </div>
              <p className="text-xs text-slate-500">
                Instantly switch active role to test City Administrator views or Public Citizen features.
              </p>
              <div className="flex gap-2 pt-2">
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
