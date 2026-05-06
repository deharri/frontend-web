import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Toggle dark mode by adding `class="dark"` on the <html> element.
  // ThemeContext does this; see src/theme/ThemeContext.tsx.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors — identical in light + dark.
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#3b82f6',
          lighter: '#60a5fa',
        },

        // Theme-aware tokens — backed by CSS variables defined in src/index.css.
        // Existing components keep using bg-card / text-foreground / border-border
        // / etc. and now automatically adapt to whichever mode is active.
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        cardForeground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        mutedForeground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',

        // Static accent palettes — used for status badges, alerts, etc.
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
          800: '#1e293b',
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
