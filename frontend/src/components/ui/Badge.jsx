import React from 'react';

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) {
  const base = 'inline-flex items-center gap-1 font-semibold rounded-full border transition-colors';

  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
