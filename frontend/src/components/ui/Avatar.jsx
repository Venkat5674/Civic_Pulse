import React from 'react';

/**
 * Deterministically selects a gradient color based on the user's name
 */
const COLOR_GRADIENTS = [
  'from-violet-600 to-indigo-700',
  'from-indigo-600 to-purple-700',
  'from-blue-600 to-violet-700',
  'from-emerald-600 to-teal-700',
  'from-purple-600 to-pink-700',
  'from-rose-600 to-purple-700',
  'from-amber-600 to-orange-700',
  'from-cyan-600 to-blue-700',
];

function getGradientForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_GRADIENTS.length;
  return COLOR_GRADIENTS[index];
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-16 h-16 text-2xl font-black',
};

export function Avatar({ name = '', size = 'md', className = '' }) {
  const initial = name && typeof name === 'string' && name.trim().length > 0
    ? name.trim().charAt(0).toUpperCase()
    : 'U';

  const gradient = getGradientForName(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradient} text-white font-extrabold flex items-center justify-center shrink-0 ring-2 ring-violet-200/80 dark:ring-violet-800/60 shadow-xs select-none ${sizeClass} ${className}`}
      title={name}
      aria-label={`Profile avatar for ${name}`}
    >
      <span>{initial}</span>
    </div>
  );
}
