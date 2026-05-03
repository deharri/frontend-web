import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#3b82f6',
          lighter: '#60a5fa',
        },
        background: '#f8fafc',
        foreground: '#1e293b',
        card: '#ffffff',
        cardForeground: '#1e293b',
        border: '#e2e8f0',
        muted: '#f1f5f9',
        mutedForeground: '#64748b',
        destructive: '#ef4444',
        red: { 50: '#fef2f2', 600: '#dc2626', 700: '#b91c1c' },
        green: { 50: '#f0fdf4', 100: '#dcfce7', 600: '#16a34a', 700: '#15803d' },
        amber: { 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b' },
        blue: { 50: '#eff6ff', 100: '#dbeafe', 700: '#1d4ed8' },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
