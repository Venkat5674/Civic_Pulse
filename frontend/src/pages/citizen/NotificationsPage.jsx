import React from 'react';
import { CitizenLayout } from '../../components/layout/CitizenLayout';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <CitizenLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-midnight-800">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time updates regarding your reported issues and municipal responses
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="bg-white dark:bg-midnight-850/90 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl divide-y divide-slate-100 dark:divide-midnight-800/60 overflow-hidden backdrop-blur-xl transition-all">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500" />
              <p className="text-sm font-semibold">You have no notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${
                  !notif.readAt
                    ? 'bg-brand-50/50 dark:bg-brand-950/40 hover:bg-brand-50 dark:hover:bg-brand-950/60'
                    : 'hover:bg-slate-50/80 dark:hover:bg-midnight-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      !notif.readAt
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-midnight-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                      {!notif.readAt && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                </div>

                {notif.issueId && (
                  <Link to={`/issues/${notif.issueId}`} className="shrink-0">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Report
                    </Button>
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </CitizenLayout>
  );
}
