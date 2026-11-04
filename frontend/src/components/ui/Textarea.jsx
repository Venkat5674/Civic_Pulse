import React, { forwardRef } from 'react';

export const Textarea = forwardRef(
  ({ label, error, helperText, rows = 4, className = '', id, ...props }, ref) => {
    const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={areaId} className="block text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-200">
            {label}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-lg border bg-white/90 dark:bg-purple-950/60 p-3 text-sm text-purple-950 dark:text-purple-100 placeholder:text-purple-400/80 transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:bg-purple-100 disabled:text-purple-500 ${
            error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-purple-200 dark:border-purple-800'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-purple-700/70 dark:text-purple-300/70">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
