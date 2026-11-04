import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this data. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-rose-200 rounded-2xl bg-rose-50/50">
      <div className="p-3 bg-rose-100 rounded-full text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 max-w-md mb-4">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
