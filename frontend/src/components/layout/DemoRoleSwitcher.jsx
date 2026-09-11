import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Eye, Sparkles, ChevronDown, Check, Menu } from 'lucide-react';

export function DemoRoleDropdown() {
  const { user, isAdmin, isCitizen, switchDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'City Admin', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (isCitizen) return { label: 'Citizen', color: 'bg-brand-500/20 text-brand-300 border-brand-500/30' };
    return { label: 'Guest', color: 'bg-slate-700/50 text-slate-300 border-slate-600/50' };
  };

  const currentRole = getRoleBadge();

  return (
    <div className="relative" ref={menuRef}>
      {/* Navbar Dropdown / Hamburger Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition border border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 group"
        title="Switch Demo Role (Hamburger Menu)"
      >
        <div className="flex items-center gap-1.5">
          <Menu className="w-4 h-4 text-slate-300 group-hover:text-white transition" />
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
        </div>
        <span className="hidden sm:inline text-slate-400 font-normal">Role:</span>
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentRole.color}`}>
          {currentRole.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Hamburger Dropdown Drawer Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-72 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-white/10">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold text-slate-200 tracking-tight">
                Demo Role Switcher
              </span>
            </div>
            <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-semibold">
              Live Demo
            </span>
          </div>

          {/* Active User Card */}
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0 border border-slate-600">
              {user ? user.name?.charAt(0) : 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Current Mode
              </span>
              <span className="block text-xs font-bold text-slate-100 truncate">
                {user ? `${user.name}` : 'Public Guest Visitor'}
              </span>
            </div>
          </div>

          {/* Role Options */}
          <div className="space-y-1.5">
            {/* Citizen Option */}
            <button
              onClick={() => {
                switchDemoRole('CITIZEN');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition ${
                isCitizen
                  ? 'bg-brand-600/90 text-white border border-brand-500 font-bold shadow-md'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isCitizen ? 'bg-brand-500' : 'bg-slate-800 text-brand-400'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100">Citizen</div>
                  <div className="text-[10px] text-slate-400 font-normal">Report & track civic issues</div>
                </div>
              </div>
              {isCitizen && <Check className="w-4 h-4 text-white shrink-0" />}
            </button>

            {/* City Admin Option */}
            <button
              onClick={() => {
                switchDemoRole('ADMIN');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition ${
                isAdmin
                  ? 'bg-amber-600/90 text-white border border-amber-500 font-bold shadow-md'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isAdmin ? 'bg-amber-500' : 'bg-slate-800 text-amber-400'}`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100">City Admin</div>
                  <div className="text-[10px] text-slate-400 font-normal">Manage & resolve issues</div>
                </div>
              </div>
              {isAdmin && <Check className="w-4 h-4 text-white shrink-0" />}
            </button>

            {/* Guest Option */}
            <button
              onClick={() => {
                switchDemoRole('GUEST');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition ${
                !user
                  ? 'bg-slate-700 text-white border border-slate-600 font-bold shadow-md'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${!user ? 'bg-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100">Guest Visitor</div>
                  <div className="text-[10px] text-slate-400 font-normal">Read-only public view</div>
                </div>
              </div>
              {!user && <Check className="w-4 h-4 text-white shrink-0" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DemoRoleMobileBlock() {
  const { user, isAdmin, isCitizen, switchDemoRole } = useAuth();

  return (
    <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Quick Demo Role Switch</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono truncate max-w-[120px]">
          {user ? user.role : 'GUEST'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition ${
            isCitizen
              ? 'bg-brand-600 text-white font-bold shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <User className="w-4 h-4 mb-1 text-brand-300" />
          <span className="text-[11px]">Citizen</span>
        </button>

        <button
          onClick={() => switchDemoRole('ADMIN')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition ${
            isAdmin
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Shield className="w-4 h-4 mb-1 text-amber-300" />
          <span className="text-[11px]">Admin</span>
        </button>

        <button
          onClick={() => switchDemoRole('GUEST')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition ${
            !user
              ? 'bg-slate-700 text-white font-bold shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
          }`}
        >
          <Eye className="w-4 h-4 mb-1 text-slate-400" />
          <span className="text-[11px]">Guest</span>
        </button>
      </div>
    </div>
  );
}

// Default export alias for backwards compatibility
export function DemoRoleSwitcher() {
  return <DemoRoleDropdown />;
}
