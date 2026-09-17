/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        ink2: '#1e293b',
        inkMuted: '#475569',
        inkSubtle: '#94a3b8',
        canvas: '#f8fafc',
        canvasWarm: '#fbfcfd',
        surface: '#ffffff',
        surfaceSubtle: '#f1f5f9',
        borderSubtle: '#e2e8f0',
        borderFocus: '#f97316',
        
        bone: '#f8fafc',
        bone2: '#f1f5f9',
        paper: '#ffffff',
        ghost: '#64748b',
        line: '#e2e8f0',

        signal: '#ea580c',
        signalHover: '#c2410c',
        signalLight: '#fff7ed',
        ok: '#059669',
        okLight: '#ecfdf5',
        warn: '#e11d48',
        warnLight: '#fff1f2',
        indigoBrand: '#4f46e5',
        indigoLight: '#eef2ff',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display': ['clamp(1.5rem, 3.5vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 4px 16px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'float': '0 12px 32px -6px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
        'glow-orange': '0 4px 20px -2px rgba(234, 88, 12, 0.35)',
        'glow-emerald': '0 4px 20px -2px rgba(5, 150, 105, 0.35)',
        'glow-indigo': '0 4px 20px -2px rgba(79, 70, 229, 0.35)',
        'brutal': '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.05)',
        'brutal-sm': '0 2px 6px -1px rgba(15, 23, 42, 0.06)',
        'brutal-lg': '0 10px 25px -4px rgba(15, 23, 42, 0.12)',
        'brutal-signal': '0 4px 16px -2px rgba(234, 88, 12, 0.35)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
