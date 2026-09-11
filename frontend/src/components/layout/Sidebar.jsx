import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  Shield,
  Layers,
  Users,
  BarChart3,
  Settings,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export function Sidebar() {
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  const citizenNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Report an Issue', path: '/report', icon: PlusCircle },
    { label: 'My Submissions', path: '/my-issues', icon: FileText },
    { label: 'Live Map', path: '/map', icon: MapPin },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile Settings', path: '/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Issues', path: '/admin/issues', icon: FileText },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Analytics & KPIs', path: '/admin/analytics', icon: BarChart3 },
    { label: 'My Citizen Profile', path: '/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNav : citizenNav;

  return (
    <aside className="w-64 bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md border-r border-purple-200/80 dark:border-purple-900/40 shrink-0 hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4 transition-colors">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3 bg-purple-50/80 dark:bg-purple-950/40 rounded-xl border border-purple-200/80 dark:border-purple-800/50 flex items-center gap-3">
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-300 dark:ring-violet-700 shrink-0"
          />
          <div className="truncate">
            <h4 className="text-sm font-bold text-purple-950 dark:text-white truncate">{user?.name}</h4>
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-2 py-0.5 rounded uppercase border border-violet-200/50 dark:border-violet-800/50">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
            {isAdmin ? 'Administration Portal' : 'Citizen Workspace'}
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-violet-600 text-white dark:bg-violet-600 dark:text-white font-bold shadow-xs'
                      : 'text-purple-800 dark:text-purple-200 hover:bg-purple-100/70 dark:hover:bg-purple-950/60 hover:text-purple-950 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-purple-100 dark:border-purple-900/30">
        <p className="text-[11px] text-purple-600/70 dark:text-purple-400/70 text-center font-medium">
          CivicPulse Engine • v1.0.0
        </p>
      </div>
    </aside>
  );
}
