'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/camera', label: 'camera' },
  { href: '/haggle', label: 'haggle' },
  { href: '/ledger', label: 'ledger' },
  { href: '/oracle', label: 'mcp' },
];

/**
 * SiteNav — sticky brutalist top bar shared by all pages.
 * Slim, mono, mobile-first (horizontal scroll if needed).
 */
export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 bg-bone/95 backdrop-blur border-b-2 border-ink">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-xl tracking-tighter leading-none">MARGINS</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 border-2 border-ink font-mono text-[9px] uppercase tracking-widest">
            oracle
          </span>
        </Link>
        <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto no-scrollbar">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-2.5 py-1.5 uppercase tracking-wide whitespace-nowrap transition ${
                  active ? 'bg-ink text-bone' : 'hover:bg-ink/10'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
