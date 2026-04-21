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
    },
  },
  plugins: [],
};
