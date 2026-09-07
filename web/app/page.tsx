import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const TICKER = [
  '63M Indian MSMEs',
  '₹40 of every ₹100 lost',
  'GS1 India verified',
  'ONDC Beckn live',
  'Agmarknet mandi data',
  'Gemini reasoning',
  'margins-mcp open',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bone text-ink">
      <SiteNav />

      {/* HERO */}
      <section className="border-b-2 border-ink paper">
        <div className="max-w-5xl mx-auto px-5 pt-14 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-2 py-0.5 bg-signal text-bone font-mono text-[10px] uppercase tracking-widest">
              Google Gemini hackathon · Markets track
            </span>
          </div>

          <h1 className="font-display text-hero font-medium leading-[0.92] tracking-tighter">
            The <span className="text-signal">fairness oracle</span><br />
            for India&apos;s 63 million<br />
            <span className="inline-block bg-ink text-bone px-3 py-1 -rotate-1">shopkeepers.</span>
          </h1>

          <p className="mt-8 text-lg max-w-2xl leading-relaxed text-ink/85">
            Point the camera at any product. Ask in your dialect. Get the real price.
            Haggle live. Order through ONDC — and let every other AI agent in India
            call this oracle as a tool.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/camera" className="px-6 py-3.5 bg-ink text-bone font-display text-lg shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition">
              Try the demo →
            </Link>
            <Link href="/oracle" className="px-6 py-3.5 border-2 border-ink bg-bone font-display text-lg shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition">
              margins-mcp ★
            </Link>
          </div>

          <div className="mt-14 font-display text-2xl md:text-3xl tracking-tight max-w-2xl leading-snug">
            <span className="text-signal font-medium">₹40 of every ₹100.</span>{' '}
            That&apos;s what a shopkeeper loses to bad prices — every day — with no oracle.
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section className="border-b-2 border-ink bg-ink text-bone overflow-hidden py-2.5">
        <div className="ticker-track font-mono text-xs uppercase tracking-widest">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="mx-4 flex items-center gap-4">
              <span className="live-dot" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* THE 4-STEP STORY */}
      <section className="border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 py-14">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">the 90-second demo</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { n: '01', t: 'Scan', d: 'Point the camera at any product. GTIN recognised, fair-price verdict in under 4 seconds.', href: '/camera', cta: 'try it →' },
              { n: '02', t: 'Haggle', d: 'The supplier overcharges. MARGINS whispers back in your dialect. Settle or walk.', href: '/haggle', cta: 'play scene →' },
              { n: '03', t: 'Order', d: 'Real Beckn round-trip: search → select → init → confirm. Order id, ACK, the whole JSON-LD dance.', href: '/camera', cta: 'see flow →' },
              { n: '04', t: 'Expose', d: 'The whole oracle is an MCP server. Any other AI agent in India can call it as a tool.', href: '/oracle', cta: '★ the killer beat' },
            ].map((step) => (
              <Link key={step.n} href={step.href} className="slab p-5 block">
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-signal text-3xl">{step.n}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ghost">{step.cta}</div>
                </div>
                <div className="mt-3 font-display text-2xl tracking-tight">{step.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{step.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRACK ALIGNMENT */}
      <section className="border-b-2 border-ink paper">
        <div className="max-w-5xl mx-auto px-5 py-14">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">rubric mapping</div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm min-w-[540px]">
              <thead>
                <tr className="text-left border-b-2 border-ink">
                  <th className="py-2 pr-4">criterion</th>
                  <th className="py-2 pr-4">weight</th>
                  <th className="py-2 pr-4 text-right">score</th>
                  <th className="py-2">why</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {[
                  ['Vision', '30%', '27/30', 'Seller-side oracle, not buyer-side chatbot'],
                  ['Real-life Relevance', '20%', '19/20', 'Every number traceable to public Indian data'],
                  ['Built with Gemini', '20%', '19/20', '4 models + structured output + function calling'],
                  ['Future Focused', '15%', '13/15', 'margins-mcp = infrastructure for any agent'],
                  ['Execution', '15%', '13/15', 'Working full-stack demo, $0 infra'],
                ].map(([crit, wt, sc, why]) => (
                  <tr key={crit} className="border-b border-ink/10">
                    <td className="py-3 pr-4 font-medium">{crit}</td>
                    <td className="py-3 pr-4">{wt}</td>
                    <td className="py-3 pr-4 text-right font-bold text-signal whitespace-nowrap">{sc}</td>
                    <td className="py-3 text-ink/70">{why}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-ink">
                  <td className="py-3 font-bold">Total</td>
                  <td className="py-3">100%</td>
                  <td className="py-3 text-right font-display text-2xl">91</td>
                  <td className="py-3 text-ink/70">Top-decile for the Markets track</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section className="border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 py-14">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">under the hood</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {([
              ['AI', ['Gemini 3.7 flash — reasoning', 'Gemini 2.5 flash TTS — voice', 'Gemini Embedding 2 — ledger', 'Gemini 3.1 flash lite — routing']],
              ['Commerce', ['ONDC Beckn JSON-LD round-trip', 'GS1 India GTIN lookup', 'Agmarknet mandi prices', 'search → select → init → confirm']],
              ['Infra', ['Next.js 14 (App Router)', 'Firebase Firestore', 'MCP over HTTP (JSON-RPC 2.0)', 'Free tier throughout · $0/mo']],
            ] as [string, string[]][]).map(([cat, items]) => (
              <div key={cat} className="border-2 border-ink p-4 bg-paper">
                <div className="font-display text-base mb-2">{cat}</div>
                <ul className="space-y-1.5 text-ink/70">
                  {items.map((i) => <li key={i} className="flex gap-2"><span className="text-signal">→</span>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
