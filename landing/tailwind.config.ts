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
        ok: '#1f7a3a',
        warn: '#b3500e',
        ghost: '#9ca3af',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 7vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
      },
      boxShadow: {
        'brutal': '4px 4px 0 0 #0a0a0a',
        'brutal-lg': '8px 8px 0 0 #0a0a0a',
        'brutal-signal': '4px 4px 0 0 #ff5b1f',
      },
    },
  },
  plugins: [],
};