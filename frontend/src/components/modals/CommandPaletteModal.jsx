import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  Map,
  PlusCircle,
  LayoutDashboard,
  FileText,
  Bell,
  User,
  Shield,
  Eye,
  Sun,
  Moon,
  MapPin,
  X,
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useIssues } from '../../context/IssueContext';

export function CommandPaletteModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, isAdmin, switchDemoRole, openLocationPrompt } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { issues } = useIssues();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build items array
  const staticItems = [
    {
      category: 'Navigation',
      id: 'nav-explore',
      title: 'Explore Issues',
      subtitle: 'Browse all civic reports with filters',
      icon: Compass,
      iconBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
      action: () => {
        navigate('/explore');
        onClose();
      },
    },
    {
      category: 'Navigation',
      id: 'nav-map',
      title: 'Live Issue Map',
      subtitle: 'Interactive map pin locator',
      icon: Map,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      action: () => {
        navigate('/map');
        onClose();
      },
    },
    {
      category: 'Action',
      id: 'act-report',
      title: 'Report New Issue',
      subtitle: 'Submit a new civic concern with GPS pin',
      icon: PlusCircle,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      action: () => {
        navigate('/report');
        onClose();
      },
    },
    {
      category: 'Navigation',
      id: 'nav-dashboard',
      title: isAdmin ? 'Admin Dashboard' : 'User Dashboard',
      subtitle: 'Overview of activity and metrics',
      icon: LayoutDashboard,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      action: () => {
        navigate(isAdmin ? '/admin' : '/dashboard');
        onClose();
      },
    },
    {
      category: 'Navigation',
      id: 'nav-my-issues',
      title: 'My Reported Issues',
      subtitle: 'Track status of your submitted tickets',
      icon: FileText,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      action: () => {
        navigate('/my-issues');
        onClose();
      },
    },
    {
      category: 'Navigation',
      id: 'nav-notifications',
      title: 'Notifications & Alerts',
      subtitle: 'System updates and issue status changes',
      icon: Bell,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      action: () => {
        navigate('/notifications');
        onClose();
      },
    },
    {
      category: 'Demo Roles',
      id: 'role-citizen',
      title: 'Switch to Citizen Role',
      subtitle: 'Report issues and upvote neighborhood concerns',
      icon: User,
      iconBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
      action: () => {
        switchDemoRole('CITIZEN');
        onClose();
      },
    },
    {
      category: 'Demo Roles',
      id: 'role-admin',
      title: 'Switch to Admin Role',
      subtitle: 'Manage categories, status, and analytics',
      icon: Shield,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      action: () => {
        switchDemoRole('ADMIN');
        onClose();
      },
    },
    {
      category: 'Demo Roles',
      id: 'role-guest',
      title: 'Switch to Guest Mode',
      subtitle: 'Browse public map and issue stream without login',
      icon: Eye,
      iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      action: () => {
        switchDemoRole('GUEST');
        onClose();
      },
    },
    {
      category: 'Settings',
      id: 'set-theme',
      title: isDark ? 'Switch to Light Theme' : 'Switch to Dark Night Theme',
      subtitle: 'Toggle theme color mode',
      icon: isDark ? Sun : Moon,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      category: 'Settings',
      id: 'set-location',
      title: 'Change My Location',
      subtitle: 'Detect GPS position or enter custom location',
      icon: MapPin,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      action: () => {
        openLocationPrompt();
        onClose();
      },
    },
  ];

  // Dynamic matching issues
  const matchingIssues = query.trim()
    ? issues
        .filter(
          (i) =>
            i.title.toLowerCase().includes(query.toLowerCase()) ||
            i.categoryName?.toLowerCase().includes(query.toLowerCase()) ||
            i.address?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
        .map((issue) => ({
          category: 'Issues',
          id: `issue-${issue.id}`,
          title: issue.title,
          subtitle: `${issue.categoryName || 'General'} • ${issue.address || 'Metro City'}`,
          icon: MapPin,
          iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          action: () => {
            navigate(`/issues/${issue.id}`);
            onClose();
          },
        }))
    : [];

  const filteredItems = query.trim()
    ? [
        ...staticItems.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        ),
        ...matchingIssues,
      ]
    : staticItems;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (query.trim()) {
        navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f0c1e] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-midnight-700/80 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Search Top Header Input */}
        <div className="p-4 border-b border-slate-100 dark:border-midnight-800 flex items-center gap-3 bg-slate-50/50 dark:bg-midnight-900/50">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search issues, roles, settings..."
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold bg-white dark:bg-midnight-800 text-slate-400 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-midnight-700 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-150 text-left ${
                    isSelected
                      ? 'bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/30 shadow-2xs'
                      : 'hover:bg-slate-100/80 dark:hover:bg-midnight-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${item.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-midnight-800 text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-brand-600 dark:text-brand-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Command className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No results found for "{query}"</p>
              <button
                onClick={() => {
                  navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline pt-1"
              >
                <span>Search all issues for "{query}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Keyboard Shortcuts Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-900/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-midnight-800 border border-slate-200 dark:border-midnight-700 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-midnight-800 border border-slate-200 dark:border-midnight-700 font-mono text-[10px]">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-midnight-800 border border-slate-200 dark:border-midnight-700 font-mono text-[10px]">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">CivicPulse Smart Command</span>
          </div>
        </div>
      </div>
    </div>
  );
}
