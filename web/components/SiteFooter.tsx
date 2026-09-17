import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 px-4 pt-8 pb-28 text-slate-500 bg-white/50">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-mono text-xs text-slate-400">
          <Link href="/camera" className="hover:text-slate-900 transition">/camera</Link>
          <Link href="/haggle" className="hover:text-slate-900 transition">/haggle</Link>
          <Link href="/ledger" className="hover:text-slate-900 transition">/ledger</Link>
          <Link href="/oracle" className="hover:text-slate-900 transition">/oracle</Link>
          <a href="/api/beckn/bpp" className="hover:text-slate-900 transition">/api/beckn/bpp</a>
          <a href="/.well-known/mcp.json" className="hover:text-slate-900 transition">/mcp.json</a>
        </div>
        <p className="font-mono text-[11px] text-slate-400">
          Built for India&apos;s 63M MSMEs &bull; Google Gemini &bull; ONDC Beckn &bull; MCP
        </p>
      </div>
    </footer>
  );
}
