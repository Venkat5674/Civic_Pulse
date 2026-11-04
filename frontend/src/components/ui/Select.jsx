import React, { forwardRef } from 'react';

export const Select = forwardRef(
  ({ label, error, helperText, options = [], className = '', containerClassName = '', id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1.5 ${containerClassName || 'w-full'}`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-2xs">
          <select
            id={selectId}
            ref={ref}
            className={`w-full rounded-xl border bg-slate-50/90 dark:bg-midnight-900/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all focus:bg-white dark:focus:bg-midnight-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-100 dark:disabled:bg-midnight-950 disabled:text-slate-400 cursor-pointer ${
              error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-midnight-700/80'
            } ${className}`}
            {...props}
          >
            {children
              ? children
              : options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0f0c1e] text-slate-900 dark:text-slate-100 py-1">
                    {opt.label}
                  </option>
                ))}
          </select>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
