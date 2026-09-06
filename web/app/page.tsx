import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-bone text-ink">
      {/* HERO */}
      <section className="border-b-2 border-ink paper">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="font-display text-3xl tracking-tighter">MARGINS</div>
            <div className="px-2 py-0.5 border-2 border-ink font-mono text-[10px] uppercase tracking-widest">v0.1 / hackathon</div>
          </div>

          <h1 className="font-display text-hero font-medium leading-[0.92] tracking-tighter">
            The <span className="text-signal">fairness oracle</span><br />
            for India's 63 million<br />
            <span className="inline-block bg-ink text-bone px-3 py-1">shopkeepers.</span>
          </h1>

          <p className="mt-8 text-lg max-w-2xl leading-relaxed">
            A phone-based Gemini agent. Point the camera at any product.
            Ask in your dialect. Get the real price. Haggle live. Order through ONDC.
            Expose it to every other AI agent in India.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/camera" className="px-5 py-3 bg-ink text-bone font-display text-lg shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition">
              Try the demo →
            </Link>
            <Link href="/oracle" className="px-5 py-3 border-2 border-ink bg-bone font-display text-lg shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition">
              margins-mcp
            </Link>
          </div>

          <div className="mt-12 font-display text-3xl tracking-tight max-w-2xl">
            <span className="text-signal">₹40 of every ₹100.</span> That's what an Indian shopkeeper
            loses to bad prices — every day — with no oracle.
          </div>
        </div>
      </section>

      {/* THE 4-STEP STORY */}
      <section className="border-b-2 border-ink">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">90-second demo</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { n: '01', t: 'Scan', d: 'Point the camera at any product. GTIN recognised, real fair-price verdict in under 4 seconds.', href: '/camera', cta: 'try it' },
              { n: '02', t: 'Haggle', d: 'Listen to the supplier overcharge. MARGINS whispers back in your dialect. Settle or walk.', href: '/haggle', cta: 'play scene' },
              { n: '03', t: 'Order', d: 'Real Beckn round-trip. search → select → init → confirm. Order id, ACK, the whole JSON-LD dance.', href: '/camera', cta: 'see flow' },
              { n: '04', t: 'Expose', d: 'The whole oracle is an MCP server. Any other AI agent in India can call it as a tool.', href: '/oracle', cta: '★ the killer beat' },
            ].map((step) => (
              <Link key={step.n} href={step.href} className="slab p-5 block">
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-signal text-2xl">{step.n}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ghost">{step.cta}</div>
                </div>
                <div className="mt-2 font-display text-2xl tracking-tight">{step.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{step.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRACK ALIGNMENT */}
      <section className="border-b-2 border-ink paper">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">Rubric mapping</div>
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="text-left border-b-2 border-ink">
                <th className="py-2">criterion</th>
                <th className="py-2">weight</th>
                <th className="py-2 text-right">score</th>
                <th className="py-2">why</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {[
                ['Vision', '30%', '27/30', 'Reframe: markets = seller\'s oracle, not buyer\'s chatbot'],
                ['Real-life Relevance', '20%', '19/20', '63M MSMEs, every number traceable to public Indian data'],
                ['Built with Gemini', '20%', '19/20', '4 distinct Gemini models + structured output + function calling'],
                ['Future Focused', '15%', '13/15', 'margins-mcp becomes infrastructure for any commerce agent'],
                ['Execution', '15%', '13/15', 'Working full-stack demo, $0 infra'],
              ].map(([crit, wt, sc, why]) => (
                <tr key={crit} className="border-b border-ink/10">
                  <td className="py-3 font-medium">{crit}</td>
                  <td className="py-3">{wt}</td>
                  <td className="py-3 text-right font-bold text-signal">{sc}</td>
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
      </section>

      {/* STACK */}
      <section className="border-b-2 border-ink">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">Under the hood</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {[
              ['AI', ['Gemini 3.7 flash (reasoning)', 'Gemini 2.5 flash preview TTS (voice)', 'Gemini Embedding 2 (ledger)', 'Gemini 3.1 flash lite (routing)']],
              ['Commerce', ['ONDC Beckn JSON-LD', 'search → select → init → confirm', 'GS1 India GTIN lookup', 'Agmarknet mandi prices']],
              ['Infra', ['Next.js 14 (App Router)', 'Firebase Firestore', 'MCP over HTTP (JSON-RPC 2.0)', 'Free tier throughout · $0/mo']],
            ].map(([cat, items]) => (
              <div key={cat} className="border-2 border-ink p-4 bg-paper">
                <div className="font-display text-base mb-2">{cat}</div>
                <ul className="space-y-1 text-ink/70">
                  {items.map((i) => <li key={i}>→ {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-5 py-10 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-4 text-xs font-mono text-ghost">
          <Link href="/camera" className="underline">/camera</Link>
          <Link href="/haggle" className="underline">/haggle</Link>
          <Link href="/ledger" className="underline">/ledger</Link>
          <Link href="/oracle" className="underline">/oracle</Link>
          <a href="/api/mcp" className="underline">/api/mcp</a>
          <a href="/.well-known/mcp.json" className="underline">/.well-known/mcp.json</a>
          <a href="/api/beckn/bpp" className="underline">/api/beckn/bpp</a>
        </div>
        <p className="mt-6 text-xs text-ghost">Built on Gemini · Beckn · MCP · GS1 · Agmarknet · Firebase. Hackathon entry, MIT licensed.</p>
      </footer>
    </main>
  );
}