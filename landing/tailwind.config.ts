/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        bone: '#f5f5f0',
        paper: '#faf9f5',
        signal: '#ff5b1f',
        'signal-ink': '#cc4818',
        ok: '#1f7a3a',
        warn: '#b3500e',
        ghost: '#9ca3af',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 7vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'display': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      borderRadius: { none: '0' },
      boxShadow: {
        'brutal': '4px 4px 0 0 #0a0a0a',
        'brutal-lg': '8px 8px 0 0 #0a0a0a',
        'brutal-signal': '4px 4px 0 0 #ff5b1f',
        'brutal-signal-lg': '8px 8px 0 0 #ff5b1f',
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
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
