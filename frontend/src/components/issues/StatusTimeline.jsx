import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, User, FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function StatusTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <p className="text-xs text-slate-500 italic">No historical status transitions logged yet.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item, index) => {
        const dateStr = item.createdAt
          ? format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')
          : '';

        return (
          <div key={item.id || index} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[1.375rem] top-0.5 w-5 h-5 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 group-hover:scale-110 transition">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.newStatus} size="sm" />
                  {item.oldStatus && (
                    <span className="text-xs text-slate-400">
                      (changed from <span className="font-semibold">{item.oldStatus}</span>)
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">{dateStr}</span>
              </div>

              {item.note && (
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-slate-100">
                  {item.note}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <User className="w-3 h-3 text-slate-400" />
                <span>Updated by {item.changedBy || 'Administrator'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
