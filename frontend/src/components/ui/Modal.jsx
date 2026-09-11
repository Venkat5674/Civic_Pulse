import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, description, children, footer, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-midnight-850 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-midnight-700/80 overflow-hidden transform transition-all z-10 animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-midnight-800 px-6 py-4">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-900 dark:text-slate-100">{children}</div>

        {/* Footer */}
        {footer && <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-midnight-800 px-6 py-4 bg-slate-50/80 dark:bg-midnight-900/60">{footer}</div>}
      </div>
    </div>
  );
}
