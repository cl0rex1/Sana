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
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    danger: 'bg-red-50 text-red-600 border border-red-100',
    warning: 'bg-amber-50 text-amber-600 border border-amber-100',
    outline: 'bg-white text-gray-700 border border-gray-200 shadow-sm',
    ghost: 'bg-gray-50 text-gray-500 border-none',
    info: 'bg-blue-50 text-blue-600 border border-blue-100',
    purple: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
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
