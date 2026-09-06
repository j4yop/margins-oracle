// Public marketing landing — links to the demo app.
// Set NEXT_PUBLIC_DEMO_URL to your deployed demo URL (e.g. https://margins.vercel.app)
// Set NEXT_PUBLIC_MCP_URL to your deployed MCP server (e.g. https://margins-mcp.vercel.app)

const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL ?? 'https://margins-demo.vercel.app';
const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL ?? 'https://margins-mcp.vercel.app';

export default function Home() {
  return (
    <main className="min-h-screen bg-bone text-ink">
      {/* NAV */}
      <nav className="border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="font-display text-2xl tracking-tighter">MARGINS</div>
          <div className="hidden md:flex gap-6 font-mono text-xs uppercase tracking-widest">
            <a href="#problem" className="hover:underline">Problem</a>
            <a href="#solution" className="hover:underline">Solution</a>
            <a href="#stack" className="hover:underline">Stack</a>
            <a href="#try" className="hover:underline">Try</a>
          </div>
          <a href={DEMO_URL} className="px-4 py-2 bg-ink text-bone font-mono text-xs uppercase tracking-widest">Demo →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="paper border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 py-24">
          <div className="inline-block px-3 py-1 mb-6 border-2 border-ink font-mono text-[10px] uppercase tracking-widest">
            Google Gemini hackathon entry
          </div>
          <h1 className="font-display text-hero font-medium leading-[0.92] tracking-tighter max-w-4xl">
            <span className="text-signal">₹40 of every ₹100.</span>
            <br />That's what an Indian shopkeeper
            <br />loses to bad prices — every day.
          </h1>
          <p className="mt-8 text-xl max-w-2xl leading-relaxed">
            MARGINS is a phone-based <strong>Gemini agent</strong> that reads any product,
            cross-checks GS1 + Agmarknet + ONDC Beckn, haggles in your dialect, and exposes
            itself as an MCP server any other AI agent in India can call.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={DEMO_URL} className="px-6 py-4 bg-ink text-bone font-display text-xl shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition">
              Try the live demo →
            </a>
            <a href={`${MCP_URL}/.well-known/mcp.json`} className="px-6 py-4 border-2 border-ink bg-bone font-display text-xl shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition">
              margins-mcp
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">The problem</div>
          <h2 className="font-display text-display tracking-tight max-w-3xl">
            India's 63 million small retailers have <span className="bg-ink text-bone px-2">no oracle</span> for what anything should cost.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-sm">
            {[
              ['12%', 'average supplier mark-up on FMCG (industry estimate)'],
              ['90%', "of Indian retail still happens at the kirana — but digitally un-served"],
              ['₹40 of ₹100', "lost to bad prices per transaction (conservative estimate)"],
            ].map(([n, l]) => (
              <div key={n} className="slab p-5">
                <div className="font-display text-5xl text-signal">{n}</div>
                <div className="mt-2 text-ink/75">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="border-b-2 border-ink paper">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">The solution</div>
          <h2 className="font-display text-display tracking-tight max-w-3xl">
            MARGINS: 4 steps, 90 seconds, ₹0 infra.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', t: 'Scan', d: 'Point the camera at any product. GTIN recognised. Fair price returned in under 4 seconds.' },
              { n: '02', t: 'Haggle', d: 'The supplier overcharges. MARGINS whispers back in your dialect. Settle or walk.' },
              { n: '03', t: 'Order', d: 'Real ONDC Beckn round-trip: search → select → init → confirm. Order id, ACK, the whole JSON-LD.' },
              { n: '04', t: 'Expose', d: 'margins-mcp. Any other AI agent in India can call it as a tool. Infrastructure, not a chatbot.' },
            ].map((s) => (
              <div key={s.n} className="slab p-5">
                <div className="font-mono text-signal text-2xl">{s.n}</div>
                <div className="mt-2 font-display text-xl tracking-tight">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="border-b-2 border-ink">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">Under the hood</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {[
              ['AI', ['Gemini 3.7 flash (reasoning + JSON schema)', 'Gemini 2.5 flash preview TTS (voice)', 'Gemini Embedding 2 (ledger)', 'Gemini 3.1 flash lite (routing)']],
              ['Commerce', ['ONDC Beckn JSON-LD (4-step round-trip)', 'GS1 India GTIN lookup', 'Agmarknet mandi prices', 'Bhashini (planned)']],
              ['Infra', ['Next.js 14 (App Router)', 'Firebase Firestore (1 GB free)', 'MCP over HTTP (JSON-RPC 2.0)', 'Free tier throughout · $0/mo']],
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

      {/* TRY */}
      <section id="try" className="border-b-2 border-ink paper">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-6">Try it</div>
          <h2 className="font-display text-display tracking-tight max-w-3xl">
            One URL. Three demos. ~90 seconds total.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href={`${DEMO_URL}/camera`} className="slab p-5 block">
              <div className="font-mono text-signal text-2xl">01</div>
              <div className="mt-2 font-display text-xl">Camera + fair price</div>
              <div className="mt-2 text-sm text-ink/75">Real product, real Gemini reasoning, Beckn order button.</div>
            </a>
            <a href={`${DEMO_URL}/haggle`} className="slab p-5 block">
              <div className="font-mono text-signal text-2xl">02</div>
              <div className="mt-2 font-display text-xl">Haggling scene</div>
              <div className="mt-2 text-sm text-ink/75">Generated script + Tamil/Hindi TTS, settle or walk.</div>
            </a>
            <a href={`${DEMO_URL}/oracle`} className="slab p-5 block border-signal">
              <div className="font-mono text-signal text-2xl">03 ★</div>
              <div className="mt-2 font-display text-xl">margins-mcp</div>
              <div className="mt-2 text-sm text-ink/75">The oracle as infrastructure. JSON-RPC 2.0 over HTTP.</div>
            </a>
          </div>
          <a href={DEMO_URL} className="mt-10 inline-block px-6 py-4 bg-ink text-bone font-display text-xl shadow-brutal">
            Open the full demo →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-5 py-10 max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-4 text-xs font-mono text-ghost">
          <a href={DEMO_URL} className="underline">demo</a>
          <a href={`${MCP_URL}/.well-known/mcp.json`} className="underline">mcp discovery</a>
          <a href="https://github.com/mattpocock/skills" className="underline">inspired by matt pocock skills</a>
        </div>
        <p className="mt-6 text-xs text-ghost">Built on Gemini · Beckn · MCP · GS1 · Agmarknet · Firebase.</p>
      </footer>
    </main>
  );
}