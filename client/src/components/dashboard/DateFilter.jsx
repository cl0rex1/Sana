import React from 'react';

/**
 * Date range filter with dual slider for the statistics dashboard.
 * Controls the visible time window (2024-2026).
 */
const DateFilter = ({ fromIndex, toIndex, maxIndex, onChange, labels }) => {
  const handleFromChange = (e) => {
    const val = parseInt(e.target.value);
    if (val <= toIndex) {
      onChange(val, toIndex);
    }
  };

  const handleToChange = (e) => {
    const val = parseInt(e.target.value);
    if (val >= fromIndex) {
      onChange(fromIndex, val);
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Date Range Filter
        </h3>
        <span className="text-xs font-mono text-accent-cyan">
          {labels[fromIndex]} — {labels[toIndex]}
        </span>
      </div>

      {/* From slider */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-2">From: {labels[fromIndex]}</label>
          <input
            type="range"
            min={0}
            max={maxIndex}
            value={fromIndex}
            onChange={handleFromChange}
            className="w-full h-1.5 bg-primary-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan
              [&::-webkit-slider-thumb]:shadow-glow-cyan [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
              [&::-webkit-slider-thumb]:hover:scale-125"
          />
        </div>

        {/* To slider */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">To: {labels[toIndex]}</label>
          <input
            type="range"
            min={0}
            max={maxIndex}
            value={toIndex}
            onChange={handleToChange}
            className="w-full h-1.5 bg-primary-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-purple
              [&::-webkit-slider-thumb]:shadow-glow-purple [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
              [&::-webkit-slider-thumb]:hover:scale-125"
          />
        </div>
      </div>

      {/* Range visualization */}
      <div className="mt-4 flex justify-between text-[10px] text-gray-600">
        <span>Jan 2024</span>
        <span>Jan 2025</span>
        <span>Dec 2026</span>
      </div>
    </div>
  );
};

export default DateFilter;
