import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  User,
  Eye,
  Sparkles,
  ChevronDown,
  Check,
  Menu,
  Zap,
  Droplets,
  Car,
  Building,
} from 'lucide-react';

export function DemoRoleDropdown() {
  const navigate = useNavigate();
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
    if (isAdmin) {
      if (user?.department === 'Electrical Department') {
        return { label: '⚡ Electrical Admin', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
      }
      if (user?.department === 'Water Department') {
        return { label: '💧 Water Admin', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      }
      if (user?.department === 'Road Safety Department') {
        return { label: '🛣️ Road Safety Admin', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      }
      if (user?.department === 'Municipal Department') {
        return { label: '🏛️ Municipal Admin', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      }
      return { label: '🛡️ Super Admin', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (isCitizen) return { label: 'Citizen', color: 'bg-brand-500/20 text-brand-300 border-brand-500/30' };
    return { label: 'Guest', color: 'bg-slate-700/50 text-slate-300 border-slate-600/50' };
  };

  const currentRole = getRoleBadge();

  const handleSelectRole = (roleKey, targetPath = null) => {
    switchDemoRole(roleKey);
    setIsOpen(false);
    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Navbar Dropdown / Hamburger Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition border border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 group"
        title="Switch Demo Role (Department Admins & Citizens)"
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
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''
            }`}
        />
      </button>

      {/* Hamburger Dropdown Drawer Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-white/10 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold text-slate-200 tracking-tight">
                Department Admins & Roles
              </span>
            </div>
            <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-semibold">
              Live Switcher
            </span>
          </div>

          {/* Active User Card */}
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0 border border-slate-600">
              {user ? user.name?.charAt(0) : 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Current Authority
              </span>
              <span className="block text-xs font-bold text-slate-100 truncate">
                {user ? `${user.name}` : 'Public Guest Visitor'}
              </span>
              {user?.department && (
                <span className="inline-block mt-0.5 text-[10px] text-amber-300 font-semibold">
                  Dept: {user.department}
                </span>
              )}
            </div>
          </div>

          {/* Department Admins Section */}
          <div className="space-y-1.5 mb-3">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 py-0.5">
              Department Authorities
            </div>

            {/* Electrical Department Admin */}
            <button
              onClick={() => handleSelectRole('ELECTRICAL_ADMIN', '/admin')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${user?.department === 'Electrical Department'
                ? 'bg-yellow-600/30 text-white border border-yellow-500 font-bold shadow-xs'
                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>Electrical Department</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Lighting & power hazard issues</div>
                </div>
              </div>
              {user?.department === 'Electrical Department' && <Check className="w-4 h-4 text-yellow-400 shrink-0" />}
            </button>

            {/* Water Department Admin */}
            <button
              onClick={() => handleSelectRole('WATER_ADMIN', '/admin')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${user?.department === 'Water Department'
                ? 'bg-sky-600/30 text-white border border-sky-500 font-bold shadow-xs'
                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>Water Department</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Leaks, drainage & pipelines</div>
                </div>
              </div>
              {user?.department === 'Water Department' && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
            </button>

            {/* Road Safety Department Admin */}
            <button
              onClick={() => handleSelectRole('ROADS_ADMIN', '/admin')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${user?.department === 'Road Safety Department'
                ? 'bg-orange-600/30 text-white border border-orange-500 font-bold shadow-xs'
                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>Road Safety Department</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Potholes, asphalt & traffic signals</div>
                </div>
              </div>
              {user?.department === 'Road Safety Department' && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
            </button>

            {/* Municipal Department Admin */}
            <button
              onClick={() => handleSelectRole('MUNICIPAL_ADMIN', '/admin')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${user?.department === 'Municipal Department'
                ? 'bg-emerald-600/30 text-white border border-emerald-500 font-bold shadow-xs'
                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>Municipal Department</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Sanitation, garbage & parks</div>
                </div>
              </div>
              {user?.department === 'Municipal Department' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>

            {/* Super Admin (All Departments) */}
            <button
              onClick={() => handleSelectRole('SUPER_ADMIN', '/admin')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${isAdmin && (user?.department === 'ALL' || !user?.department)
                ? 'bg-amber-600/30 text-white border border-amber-500 font-bold shadow-xs'
                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>City Super Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">All departments oversight</div>
                </div>
              </div>
              {isAdmin && (user?.department === 'ALL' || !user?.department) && (
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </button>
          </div>

          {/* Citizen & Public Section */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 py-0.5">
              Public Users
            </div>

            {/* Citizen Option */}
            <button
              onClick={() => handleSelectRole('CITIZEN', '/dashboard')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${isCitizen
                ? 'bg-brand-600/90 text-white border border-brand-500 font-bold shadow-md'
                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isCitizen ? 'bg-brand-500' : 'bg-slate-800 text-brand-400'}`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100">Citizen</div>
                  <div className="text-[10px] text-slate-400 font-normal">Live camera issue reporting</div>
                </div>
              </div>
              {isCitizen && <Check className="w-4 h-4 text-white shrink-0" />}
            </button>

            {/* Guest Option */}
            <button
              onClick={() => handleSelectRole('GUEST', '/guest')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${!user
                ? 'bg-slate-700 text-white border border-slate-600 font-bold shadow-md'
                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${!user ? 'bg-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100">Guest Visitor</div>
                  <div className="text-[10px] text-slate-400 font-normal">Public explore & map view</div>
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
  const navigate = useNavigate();
  const { user, isAdmin, isCitizen, switchDemoRole } = useAuth();

  return (
    <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Quick Authority Switch</span>
        </div>
        <span className="text-[10px] text-amber-300 bg-slate-800 px-2 py-0.5 rounded font-mono truncate max-w-[130px]">
          {user?.department || (user ? user.role : 'GUEST')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <button
          onClick={() => {
            switchDemoRole('ELECTRICAL_ADMIN');
            navigate('/admin');
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 font-medium flex items-center gap-1.5 text-[11px]"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Electrical Dept</span>
        </button>

        <button
          onClick={() => {
            switchDemoRole('WATER_ADMIN');
            navigate('/admin');
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium flex items-center gap-1.5 text-[11px]"
        >
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span>Water Dept</span>
        </button>

        <button
          onClick={() => {
            switchDemoRole('ROADS_ADMIN');
            navigate('/admin');
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-300 font-medium flex items-center gap-1.5 text-[11px]"
        >
          <Car className="w-3.5 h-3.5 text-orange-400" />
          <span>Road Safety</span>
        </button>

        <button
          onClick={() => {
            switchDemoRole('MUNICIPAL_ADMIN');
            navigate('/admin');
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium flex items-center gap-1.5 text-[11px]"
        >
          <Building className="w-3.5 h-3.5 text-emerald-400" />
          <span>Municipal Dept</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
        <button
          onClick={() => {
            switchDemoRole('CITIZEN');
            navigate('/dashboard');
          }}
          className={`flex items-center justify-center gap-1 p-2 rounded-xl text-xs transition ${isCitizen ? 'bg-brand-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
        >
          <User className="w-3.5 h-3.5 text-brand-300" />
          <span>Citizen</span>
        </button>

        <button
          onClick={() => {
            switchDemoRole('SUPER_ADMIN');
            navigate('/admin');
          }}
          className={`flex items-center justify-center gap-1 p-2 rounded-xl text-xs transition ${isAdmin && (!user?.department || user?.department === 'ALL')
            ? 'bg-amber-600 text-white font-bold'
            : 'bg-slate-800 text-slate-300'
            }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-300" />
          <span>Super Admin</span>
        </button>
      </div>
    </div>
  );
}

export function DemoRoleSwitcher() {
  return <DemoRoleDropdown />;
}
