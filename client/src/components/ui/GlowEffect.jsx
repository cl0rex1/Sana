import React from 'react';

/**
 * Animated glow border effect wrapper.
 * Creates a subtle pulsing neon border around child elements.
 */
const GlowEffect = ({ children, color = 'cyan', intensity = 'medium', className = '' }) => {
  const colors = {
    cyan: 'rgba(0, 240, 255',
    purple: 'rgba(139, 92, 246',
    blue: 'rgba(14, 165, 233',
    danger: 'rgba(239, 68, 68',
    success: 'rgba(16, 185, 129',
  };

  const intensities = {
    low: { spread: '15px', opacity: 0.15 },
    medium: { spread: '25px', opacity: 0.25 },
    high: { spread: '40px', opacity: 0.4 },
  };

  const rgba = colors[color] || colors.cyan;
  const { spread, opacity } = intensities[intensity] || intensities.medium;

  return (
    <div
      className={`relative animate-pulse-glow ${className}`}
      style={{
        '--glow-color': `${rgba}, ${opacity})`,
        '--glow-spread': spread,
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-60 blur-xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at center, ${rgba}, ${opacity}), transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlowEffect;
