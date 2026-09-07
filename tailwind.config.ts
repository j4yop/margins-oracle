import type { Config } from 'tailwindcss';

export default {
  content: ['./web/**/*.{ts,tsx}', './landing/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // The "Brutalist" palette — high-contrast, single-accent
        ink: '#0a0a0a',
        ink2: '#1a1a1a',
        bone: '#f5f5f0',
        bone2: '#ebebe2',
        paper: '#faf9f5',
        signal: '#ff5b1f',    // single accent — only for CTAs and anomalies
        signalDeep: '#d63d00',
        ok: '#1f7a3a',
        warn: '#b3500e',
        ghost: '#9ca3af',
        line: '#1a1a1a',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'display': ['clamp(1.75rem, 4vw, 2.75rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        'brutal': '4px 4px 0 0 #0a0a0a',
        'brutal-sm': '2px 2px 0 0 #0a0a0a',
        'brutal-lg': '8px 8px 0 0 #0a0a0a',
        'brutal-signal': '4px 4px 0 0 #ff5b1f',
      },
    },
  },
  plugins: [],
} satisfies Config;