import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Shield, PlusCircle, Bell, User, LogOut, Menu, X, Map, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/Button';

export function PublicNavbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition ${
      isActive ? 'text-brand-600 font-bold' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">Civic</span>
            <span className="text-lg font-extrabold text-brand-600 tracking-tight">Pulse</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/explore" className={navLinkClass}>
            Explore Issues
          </NavLink>
          <NavLink to="/map" className={navLinkClass}>
            Live Issue Map
          </NavLink>
          <a href="/#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            How It Works
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            onClick={() => navigate('/report')}
            size="sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Report an Issue
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <div className="text-left text-xs">
                  <span className="block font-bold text-slate-900 truncate max-w-[100px]">{user.name}</span>
                  <span className="block text-[10px] text-slate-500 font-medium uppercase">{user.role}</span>
                </div>
              </Link>

              {!isAdmin && (
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2">
                Log In
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <NavLink
            to="/explore"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
          >
            Explore Issues
          </NavLink>
          <NavLink
            to="/map"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
          >
            Live Issue Map
          </NavLink>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Button
              onClick={() => {
                setMobileOpen(false);
                navigate('/report');
              }}
              className="w-full"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Report an Issue
            </Button>

            {isAuthenticated ? (
              <div className="space-y-2 pt-2">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-lg"
                >
                  Go to {isAdmin ? 'Admin Portal' : 'My Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-sm font-medium text-rose-600"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold border rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
