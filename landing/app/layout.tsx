import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MARGINS — the fairness oracle for India\'s 63 million shopkeepers',
  description: 'A phone-based Gemini agent. Point the camera at any product. Ask in your dialect. Get the real price. Haggle live. Order through ONDC. Expose it to every other AI agent in India.',
  openGraph: {
    title: 'MARGINS — the fairness oracle for India\'s 63M shopkeepers',
    description: 'Built on Gemini, ONDC Beckn, MCP. Hackathon entry.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}