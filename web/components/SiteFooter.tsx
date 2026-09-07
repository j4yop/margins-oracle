import Link from 'next/link';

/**
 * SiteFooter — shared brutalist footer with all routes + stack credit.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink px-5 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-ghost">
          <Link href="/camera" className="hover:text-ink hover:underline">/camera</Link>
          <Link href="/haggle" className="hover:text-ink hover:underline">/haggle</Link>
          <Link href="/ledger" className="hover:text-ink hover:underline">/ledger</Link>
          <Link href="/oracle" className="hover:text-ink hover:underline">/oracle</Link>
          <a href="/api/beckn/bpp" className="hover:text-ink hover:underline">/api/beckn/bpp</a>
          <a href="/.well-known/mcp.json" className="hover:text-ink hover:underline">/.well-known/mcp.json</a>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ghost/70">
          Gemini · Beckn · MCP · GS1 · Agmarknet · Firebase — hackathon entry, MIT
        </p>
      </div>
    </footer>
  );
}
