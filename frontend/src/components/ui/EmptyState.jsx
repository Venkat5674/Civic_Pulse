import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No reports found',
  description = 'There are no items matching your criteria at this time.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-purple-200 dark:border-purple-800/60 rounded-2xl bg-white/70 dark:bg-purple-950/40 backdrop-blur-md ${className}`}>
      <div className="p-3 bg-purple-100 dark:bg-purple-900/60 rounded-full text-violet-600 dark:text-violet-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-purple-950 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-purple-700/80 dark:text-purple-300/80 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
