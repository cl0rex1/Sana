import React from 'react';

const Card = ({
  children,
  className = '',
  glow = false, // Ignored in light theme styling to keep it clean
  padding = 'p-6',
  animate = false,
  onClick,
}) => {
  return (
    <div
      className={`
        glass-card ${padding}
        ${animate ? 'animate-fade-in' : ''}
        ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
