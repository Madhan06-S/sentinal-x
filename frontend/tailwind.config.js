/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F7F8FA',
          secondary: '#F1F4F9',
          tertiary: '#E5E9F0',
          elevated: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F1F4F9',
          muted: '#F8FAFC',
        },
        border: {
          DEFAULT: '#E5E9F0',
          subtle: '#E5E9F0',
          strong: '#D5DBE5',
          highlight: '#CBD5E1',
        },
        content: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          DEFAULT: '#2563EB',
        },
        accent: {
          DEFAULT: '#2563EB',
          subtle: '#EFF6FF',
          border: '#BFDBFE',
        },
        status: {
          critical: {
            DEFAULT: '#DC2626',
            bg: 'rgba(220, 38, 38, 0.08)',
            border: 'rgba(220, 38, 38, 0.25)',
          },
          warning: {
            DEFAULT: '#D97706',
            bg: 'rgba(217, 119, 6, 0.08)',
            border: 'rgba(217, 119, 6, 0.25)',
          },
          healthy: {
            DEFAULT: '#059669',
            bg: 'rgba(5, 150, 105, 0.08)',
            border: 'rgba(5, 150, 105, 0.25)',
          },
          info: {
            DEFAULT: '#7C3AED',
            bg: 'rgba(124, 58, 237, 0.08)',
            border: 'rgba(124, 58, 237, 0.25)',
          },
          ai: {
            DEFAULT: '#2563EB',
            bg: 'rgba(37, 99, 235, 0.08)',
            border: 'rgba(37, 99, 235, 0.25)',
          },
        },
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08)',
        'dropdown': '0 8px 24px rgba(15, 23, 42, 0.12)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      },
      borderRadius: {
        'card': '10px',
        'button': '8px',
        'input': '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-over': 'slideOver 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideOver: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
