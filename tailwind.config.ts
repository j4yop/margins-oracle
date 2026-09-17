import type { Config } from 'tailwindcss';

export default {
  content: ['./web/**/*.{ts,tsx}', './landing/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Modern Radiant Light-Theme Palette
        ink: '#0f172a',          // Slate 900
        ink2: '#1e293b',         // Slate 800
        inkMuted: '#475569',     // Slate 600
        inkSubtle: '#94a3b8',    // Slate 400
        canvas: '#f8fafc',       // Slate 50
        canvasWarm: '#fbfcfd',
        surface: '#ffffff',
        surfaceSubtle: '#f1f5f9',
        borderSubtle: '#e2e8f0', // Slate 200
        borderFocus: '#f97316',
        
        // Backward-compatibility aliases mapped to clean light surfaces
        bone: '#f8fafc',
        bone2: '#f1f5f9',
        paper: '#ffffff',
        ghost: '#64748b',
        line: '#e2e8f0',

        // Brand accents
        signal: '#ea580c',       // Vibrant Indian Saffron / Vermilion
        signalHover: '#c2410c',
        signalLight: '#fff7ed',  // Warm orange tint
        ok: '#059669',           // Lush emerald
        okLight: '#ecfdf5',
        warn: '#e11d48',         // Vivid rose for overcharge alerts
        warnLight: '#fff1f2',
        indigoBrand: '#4f46e5',  // Indigo for MCP / AI oracle surfaces
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
        // Backwards compatibility mappings for older shadow classes
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
} satisfies Config;