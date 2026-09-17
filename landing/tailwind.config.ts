/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        bone: '#f8fafc',
        paper: '#ffffff',
        signal: '#f97316',
        'signal-ink': '#ea580c',
        ok: '#059669',
        warn: '#d97706',
        ghost: '#64748b',
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '0.96', letterSpacing: '-0.04em' }],
        'display': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card': '0 4px 12px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'elevated': '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -3px rgba(15, 23, 42, 0.04)',
        'glow-orange': '0 12px 32px -4px rgba(249, 115, 22, 0.25)',
        'glow-emerald': '0 12px 32px -4px rgba(16, 185, 129, 0.25)',
        'brutal': '0 4px 14px 0 rgba(15, 23, 42, 0.10)',
        'brutal-lg': '0 12px 28px -4px rgba(15, 23, 42, 0.15)',
        'brutal-sm': '0 2px 8px 0 rgba(15, 23, 42, 0.08)',
        'brutal-signal': '0 4px 14px 0 rgba(249, 115, 22, 0.25)',
        'brutal-signal-lg': '0 10px 24px 0 rgba(249, 115, 22, 0.35)',
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        scan: 'scan 2.4s ease-in-out infinite',
        'pop-in': 'pop-in 0.25s ease both',
        blink: 'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(-45%)' },
          '50%': { transform: 'translateY(45%)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
