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
          DEFAULT: '#050810',
          secondary: '#0A0F1D',
          tertiary: '#111827',
          elevated: '#161F33',
        },
        cyanAccent: {
          DEFAULT: '#22d3ee',
          glow: 'rgba(34,211,238,0.15)',
          500: '#06b6d4',
          400: '#22d3ee',
          300: '#67e8f9',
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
            DEFAULT: '#22D3EE',
            bg: 'rgba(34, 211, 238, 0.1)',
            border: 'rgba(34, 211, 238, 0.3)',
          },
          skeptic: {
            DEFAULT: '#A855F7',
            bg: 'rgba(168, 85, 247, 0.12)',
            border: 'rgba(168, 85, 247, 0.35)',
          },
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 24px rgba(34, 211, 238, 0.15)',
        'cyan-glow-lg': '0 0 32px rgba(34, 211, 238, 0.3)',
        'red-glow': '0 0 24px rgba(239, 68, 68, 0.25)',
        'emerald-glow': '0 0 24px rgba(16, 185, 129, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'scan-line': 'scanLine 3s infinite linear',
        'fade-in': 'fadeIn 0.25s ease-out',
        'ring-draw': 'ringDraw 1s cubic-bezier(0, 0, 0.2, 1) forwards',
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
};
