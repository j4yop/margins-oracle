import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'MARGINS — the fairness oracle for India\'s 63M shopkeepers',
  description:
    'A phone-based Gemini agent. Point the camera at any product. Ask in your dialect. Get the real price. Haggle live. Order through ONDC. Expose it to every other AI agent in India.',
  openGraph: {
    title: 'MARGINS — the fairness oracle for India\'s 63M shopkeepers',
    description: 'Built on Gemini, ONDC Beckn, MCP. Google Gemini hackathon entry.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MARGINS — the fairness oracle for India\'s 63M shopkeepers',
    description: 'Built on Gemini, ONDC Beckn, MCP.',
  },
};

export const viewport: Viewport = {
  themeColor: '#f5f5f0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
