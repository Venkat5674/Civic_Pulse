import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Eye, Sparkles } from 'lucide-react';

export function DemoRoleSwitcher() {
  const { user, isAdmin, isCitizen, switchDemoRole } = useAuth();

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
        <span className="font-semibold text-slate-200">Standalone Demo Mode:</span>
        <span className="text-slate-400 hidden sm:inline">Active User:</span>
        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {user ? `${user.name} (${user.role})` : 'Public Guest'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 mr-1 hidden md:inline">Quick Role Switch:</span>

        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
            isCitizen
              ? 'bg-brand-600 text-white shadow-xs font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Citizen</span>
        </button>

        <button
          onClick={() => switchDemoRole('ADMIN')}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
            isAdmin
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>City Admin</span>
        </button>

        <button
          onClick={() => switchDemoRole('GUEST')}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
            !user
              ? 'bg-slate-700 text-white font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Guest</span>
        </button>
      </div>
    </div>
  );
}
