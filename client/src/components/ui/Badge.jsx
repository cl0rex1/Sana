import React from 'react';

/**
 * Severity/category badge with color-coded styling.
 */
const Badge = ({ children, variant = 'medium', className = '' }) => {
  const variants = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    success: 'bg-green-500/15 text-green-400 border border-green-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    outline: 'bg-transparent text-gray-300 border border-gray-600',
    ghost: 'bg-white/5 text-gray-400 border-none',
    info: 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30',
    purple: 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${variants[variant] || variants.medium} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
