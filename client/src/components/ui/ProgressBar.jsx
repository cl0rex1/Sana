import React from 'react';

/**
 * Animated progress bar with gradient fill and glow effect.
 */
const ProgressBar = ({ value = 0, max = 100, label = '', showPercentage = true, className = '' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  // Dynamic color based on progress
  const getColor = () => {
    if (percentage >= 80) return 'from-emerald-400 to-emerald-500';
    if (percentage >= 50) return 'from-accent-cyan to-accent-blue';
    if (percentage >= 25) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-red-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-mono font-semibold text-accent-cyan">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-primary-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${percentage}%`,
            boxShadow: `0 0 10px rgba(0, 240, 255, 0.3)`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
