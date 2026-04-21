import React from 'react';
import Card from '../ui/Card';

/**
 * Individual stat card with icon, value, label, and trend indicator.
 * Displays animated numbers and glow effects.
 */
const StatCard = ({ icon, label, value, suffix = '', trend, trendLabel, color = 'cyan', delay = 0 }) => {
  const colorMap = {
    cyan: {
      bg: 'bg-accent-cyan/10',
      border: 'border-accent-cyan/20',
      text: 'text-accent-cyan',
      glow: 'shadow-glow-cyan',
    },
    purple: {
      bg: 'bg-accent-purple/10',
      border: 'border-accent-purple/20',
      text: 'text-accent-purple',
      glow: 'shadow-glow-purple',
    },
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      glow: 'shadow-glow-danger',
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-glow-success',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      glow: '',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <Card
      className={`animate-slide-up hover:${c.glow} transition-shadow duration-500`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              trend >= 0
                ? 'bg-red-500/15 text-red-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className={`text-2xl md:text-3xl font-mono font-bold ${c.text}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
        </p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
        {trendLabel && <p className="text-xs text-gray-500 mt-0.5">{trendLabel}</p>}
      </div>
    </Card>
  );
};

export default StatCard;
