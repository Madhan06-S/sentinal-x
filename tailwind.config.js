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
          DEFAULT: '#0B0F17',
          secondary: '#111827',
          tertiary: '#1F2937',
          elevated: '#1E293B',
        },
        border: {
          DEFAULT: '#1E293B',
          subtle: '#334155',
          highlight: '#475569',
        },
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          DEFAULT: '#6366F1',
        },
        status: {
          critical: {
            DEFAULT: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.1)',
            border: 'rgba(239, 68, 68, 0.3)',
          },
          warning: {
            DEFAULT: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.3)',
          },
          healthy: {
            DEFAULT: '#10B981',
            bg: 'rgba(16, 185, 129, 0.1)',
            border: 'rgba(16, 185, 129, 0.3)',
          },
          info: {
            DEFAULT: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
            border: 'rgba(59, 130, 246, 0.3)',
          },
          ai: {
            DEFAULT: '#A855F7',
            bg: 'rgba(168, 85, 247, 0.12)',
            border: 'rgba(168, 85, 247, 0.35)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'scan-line': 'scanLine 3s infinite linear',
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
