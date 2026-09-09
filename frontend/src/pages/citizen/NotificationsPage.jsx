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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Notification Center</h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time updates regarding your reported issues and municipal responses
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto" />
              <p className="text-sm font-semibold">You have no notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${
                  !notif.readAt ? 'bg-brand-50/50 hover:bg-brand-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      !notif.readAt ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      {!notif.readAt && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
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
