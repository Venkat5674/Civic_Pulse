import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

import { CitizenLayout } from '../../components/layout/CitizenLayout';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { useNotifications } from '../../context/NotificationContext';

export function CitizenDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { issues } = useIssues();
  const { notifications, unreadCount } = useNotifications();

  const userIssues = issues.filter((i) => i.userId === user?.id || i.userName === user?.name);

  const openCount = userIssues.filter((i) => i.status === 'OPEN' || i.status === 'UNDER_REVIEW').length;
  const inProgressCount = userIssues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = userIssues.filter((i) => i.status === 'RESOLVED').length;

  return (
    <CitizenLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-brand-900 to-indigo-900 text-white p-8 rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-bold backdrop-blur-xs">
              <span>Citizen Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Citizen'}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track the progress of your submitted municipal reports and receive real-time status updates from city departments.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              onClick={() => navigate('/report')}
              size="lg"
              className="bg-white text-brand-900 hover:bg-slate-100 font-bold"
              leftIcon={<PlusCircle className="w-5 h-5 text-brand-600" />}
            >
              Report New Issue
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open & Under Review</span>
              <span className="block text-3xl font-extrabold text-slate-900 mt-1">{openCount}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Progress</span>
              <span className="block text-3xl font-extrabold text-slate-900 mt-1">{inProgressCount}</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved Reports</span>
              <span className="block text-3xl font-extrabold text-slate-900 mt-1">{resolvedCount}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Submissions & Notifications split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: My Active Submissions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">My Recent Submissions</h3>
              <Link to="/my-issues" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View All Submissions ({userIssues.length})
              </Link>
            </div>

            {userIssues.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600 font-semibold">You haven't reported any civic issues yet.</p>
                <Button onClick={() => navigate('/report')} size="sm">
                  Create Your First Report
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {userIssues.slice(0, 4).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle hover:border-brand-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={issue.status} size="sm" />
                        <PriorityIndicator score={issue.priorityScore} showScore={false} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {issue.categoryName}
                        </span>
                      </div>
                      <Link to={`/issues/${issue.id}`} className="block">
                        <h4 className="text-sm font-bold text-slate-900 hover:text-brand-600 truncate">
                          {issue.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{issue.address}</span>
                      </div>
                    </div>

                    <Link to={`/issues/${issue.id}`} className="shrink-0">
                      <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Notifications Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" />
                <span>Recent Notifications</span>
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-4">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No notifications to display.</p>
              ) : (
                notifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border space-y-1 transition ${
                      !notif.readAt ? 'bg-brand-50/60 border-brand-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <h5 className="text-xs font-bold text-slate-900">{notif.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    {notif.issueId && (
                      <Link
                        to={`/issues/${notif.issueId}`}
                        className="inline-block text-[11px] font-bold text-brand-600 hover:underline pt-1"
                      >
                        View Related Report &rarr;
                      </Link>
                    )}
                  </div>
                ))
              )}

              <Link
                to="/notifications"
                className="block text-center text-xs font-bold text-brand-600 hover:text-brand-700 pt-2 border-t border-slate-100"
              >
                View Notifications Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
