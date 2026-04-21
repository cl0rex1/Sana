/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light premium theme
        primary: {
          DEFAULT: '#fdfaf5', // Main light background
          50: '#ffffff',
          100: '#f5f5f5',
          200: '#e5e5e5',
          800: '#2a2a2a',
          900: '#1a1a1a', // Outer frame background
        },
        accent: {
          DEFAULT: '#000000',
          cyan: '#000000', // Replacing cyan with black for neutral look
          blue: '#1a1a1a',
          purple: '#333333',
        },
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        rainbow: {
          '0%': { borderColor: '#ef4444' },
          '20%': { borderColor: '#f59e0b' },
          '40%': { borderColor: '#10b981' },
          '60%': { borderColor: '#0ea5e9' },
          '80%': { borderColor: '#8b5cf6' },
          '100%': { borderColor: '#ef4444' },
        },
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'rainbow': 'rainbow 3s linear infinite',
      },
    },
  },
  plugins: [],
};
