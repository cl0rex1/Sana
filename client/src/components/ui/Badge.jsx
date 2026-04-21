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
