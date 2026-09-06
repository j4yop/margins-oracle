import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'MARGINS — fairness oracle for Indian MSMEs',
  description: 'Phone-based Gemini agent that reads any product, cross-checks GS1 + Beckn + Agmarknet, haggles in your dialect, places Beckn-compliant orders, and exposes itself as margins-mcp.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}