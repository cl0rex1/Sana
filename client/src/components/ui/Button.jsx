import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  loadingType = 'spinner', // 'spinner' | 'dots'
  icon: Icon,
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 btn-press focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#1a1a1a] text-white hover:bg-[#333] border border-[#1a1a1a]',
    secondary:
      'bg-white text-[#1a1a1a] border border-gray-200 hover:bg-gray-50',
    danger:
      'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    ghost:
      'bg-transparent text-[#1a1a1a] hover:bg-gray-100',
    outline:
      'bg-transparent border border-[#1a1a1a] text-[#1a1a1a] hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3 text-base gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        loadingType === 'dots' ? (
          <div className="flex gap-1.5 h-4 items-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${variant === 'primary' ? 'bg-white' : 'bg-[#1a1a1a]'}`}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
              />
            ))}
          </div>
        ) : (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )
      )}
      {Icon && !loading && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
