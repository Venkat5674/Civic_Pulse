import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-16 w-full" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
