import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Map,
  Compass,
  Search,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  FileText,
  Sun,
  Moon,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { CommandPaletteModal } from '../modals/CommandPaletteModal';

export function PublicNavbar() {
  const { user, isAuthenticated, isAdmin, isCitizen, logout, switchDemoRole, userLocation, openLocationPrompt } = useAuth();
  const { unreadCount } = useNotifications();
  const { toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync search query from URL if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearchQuery(q);
  }, [location.search]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (⌘K or Ctrl+K) to open Command Palette
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    } else {
      navigate('/explore');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
      isActive
        ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold border border-brand-500/20 dark:border-brand-500/30 shadow-2xs'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800'
    }`;

  const cityName = userLocation?.cityName?.split(',')[0] || 'Set Location';

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'City Admin', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' };
    if (isCitizen) return { label: 'Citizen', color: 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30' };
    return { label: 'Guest', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30' };
  };

  const currentRole = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#080612]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-midnight-800 shadow-xs transition-colors duration-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        
        {/* 1. Website Name (Logo & Brand) */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Civic<span className="text-brand-600 dark:text-brand-400">Pulse</span>
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80 tracking-wide uppercase">
                Enterprise
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Explore & LiveMap Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/explore" className={navLinkClass}>
            <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span>Explore</span>
          </NavLink>
          <NavLink to="/map" className={navLinkClass}>
            <Map className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>LiveMap</span>
          </NavLink>
        </nav>

        {/* 3. Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} onClick={() => setCommandPaletteOpen(true)} className="w-full relative group cursor-pointer">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setCommandPaletteOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues, locations, categories... (⌘K)"
                className="w-full pl-10 pr-12 py-2 text-xs xl:text-sm bg-slate-100/80 dark:bg-midnight-800/80 hover:bg-slate-100 dark:hover:bg-midnight-800 focus:bg-white dark:focus:bg-midnight-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-full border border-slate-200/80 dark:border-midnight-700/80 focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-2xs cursor-pointer"
                readOnly
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-block absolute right-3 text-[10px] font-mono font-semibold bg-white dark:bg-midnight-700 text-slate-400 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-midnight-600 shadow-2xs pointer-events-none">
                  ⌘K
                </kbd>
              )}
            </div>
          </form>
        </div>

        {/* 4. User Profile Trigger Button & Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full transition-all duration-200 border focus:outline-none ${
                profileDropdownOpen
                  ? 'bg-slate-100 dark:bg-midnight-800 border-brand-500/40 shadow-xs'
                  : 'bg-slate-50 dark:bg-midnight-900/60 hover:bg-slate-100 dark:hover:bg-midnight-800 border-slate-200/80 dark:border-midnight-700/80'
              }`}
              title="User Profile & Settings"
            >
              {/* User Avatar */}
              <div className="relative shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                    {user?.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-midnight-950" />
              </div>

              {/* Profile Text Label */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[110px]">
                  {user ? user.name : 'User Profile'}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight flex items-center gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-500' : isCitizen ? 'bg-brand-500' : 'bg-slate-400'}`} />
                  {currentRole.label}
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  profileDropdownOpen ? 'rotate-180 text-brand-600' : ''
                }`}
              />
            </button>

            {/* 5. User Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0f0c1e] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-midnight-700/80 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* User Info Header */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-midnight-800/80 border border-slate-200/60 dark:border-midnight-700/60 mb-2.5">
                  <div className="flex items-center gap-3">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                        {user ? user.name?.charAt(0) : <User className="w-5 h-5" />}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {user ? user.name : 'Guest Visitor'}
                        </p>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${currentRole.color}`}>
                          {currentRole.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user ? user.email : 'Public browsing mode'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary CTA: Report Issue */}
                <div className="mb-2">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/report');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/20 group transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white">
                        <PlusCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight">Report Issue</div>
                        <div className="text-[10px] text-white/80 font-medium">Submit new civic concern</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Dropdown Options List */}
                <div className="space-y-1 border-t border-slate-100 dark:border-midnight-800/80 pt-2 pb-2">
                  
                  {/* Dashboard Option */}
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 transition"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        Analytics & management overview
                      </div>
                    </div>
                  </Link>

                  {/* My Current Location Option */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      openLocationPrompt();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 transition text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">My Current Location</span>
                        <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400">Change</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {cityName}
                      </div>
                    </div>
                  </button>

                  {/* My Reported Issues */}
                  {isAuthenticated && !isAdmin && (
                    <Link
                      to="/my-issues"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100">My Reported Issues</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Track status of your reports</div>
                      </div>
                    </Link>
                  )}

                  {/* Notifications Option */}
                  {isAuthenticated && (
                    <Link
                      to="/notifications"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 relative">
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-midnight-900" />
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">Notifications</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Updates & alerts</div>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                </div>

                {/* Demo Role Switcher Embedded Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-midnight-900/90 text-slate-900 dark:text-white border border-slate-200/80 dark:border-midnight-700/80 my-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                      <span>Demo Role Switcher</span>
                    </div>
                    <span className="text-[9px] bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/60 px-1.5 py-0.5 rounded font-mono font-bold">
                      Live Preview
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Citizen Option */}
                    <button
                      onClick={() => switchDemoRole('CITIZEN')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition ${
                        isCitizen
                          ? 'bg-brand-600 text-white font-bold shadow-xs ring-1 ring-brand-500'
                          : 'bg-white dark:bg-midnight-800/80 hover:bg-slate-100 dark:hover:bg-midnight-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-midnight-700/60'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 mb-0.5 text-brand-600 dark:text-brand-300" />
                      <span className="text-[10px]">Citizen</span>
                    </button>

                    {/* Admin Option */}
                    <button
                      onClick={() => switchDemoRole('ADMIN')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition ${
                        isAdmin
                          ? 'bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-500'
                          : 'bg-white dark:bg-midnight-800/80 hover:bg-slate-100 dark:hover:bg-midnight-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-midnight-700/60'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 mb-0.5 text-amber-600 dark:text-amber-300" />
                      <span className="text-[10px]">Admin</span>
                    </button>

                    {/* Guest Option */}
                    <button
                      onClick={() => switchDemoRole('GUEST')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition ${
                        !user
                          ? 'bg-slate-700 text-white font-bold shadow-xs ring-1 ring-slate-600'
                          : 'bg-white dark:bg-midnight-800/80 hover:bg-slate-100 dark:hover:bg-midnight-700 text-slate-700 dark:text-slate-400 border border-slate-200/80 dark:border-midnight-700/60'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 mb-0.5 text-slate-500 dark:text-slate-400" />
                      <span className="text-[10px]">Guest</span>
                    </button>
                  </div>
                </div>

                {/* Footer Controls: Theme Switcher & Logout/Login */}
                <div className="pt-2 border-t border-slate-100 dark:border-midnight-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-midnight-700 text-xs font-semibold transition"
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>

                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Log In</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 border border-slate-200 dark:border-midnight-700 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-midnight-800 bg-white/95 dark:bg-[#080612]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues, locations..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-midnight-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-midnight-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>

          {/* Mobile Nav Links */}
          <div className="space-y-1">
            <NavLink
              to="/explore"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800'
                }`
              }
            >
              <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Explore Issues</span>
            </NavLink>

            <NavLink
              to="/map"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800'
                }`
              }
            >
              <Map className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Live Map</span>
            </NavLink>
          </div>

          {/* Mobile Location & Quick Role Switching */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-midnight-800/80 border border-slate-200/80 dark:border-midnight-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Location:
              </span>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openLocationPrompt();
                }}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {cityName}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Smart Command Palette Modal */}
      <CommandPaletteModal isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </header>
  );
}
