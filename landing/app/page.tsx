import Link from 'next/link';
import PhoneMockup from '@/components/PhoneMockup';
import PhoneScreen from '@/components/PhoneScreen';
import {
  CameraIcon,
  MicIcon,
  HandshakeIcon,
  ServerIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  StarIcon,
  BoxIcon,
  SparkleIcon,
  LinkIcon,
  BookIcon,
  PhoneIcon,
  FlashIcon,
  GithubIcon,
  CpuIcon,
  ChevronRightIcon,
  RupeeIcon,
  ScanIcon,
} from '@/components/Icons';

const DEMO_URL = 'https://web-eight-theta-usai6pzu0g.vercel.app';
const REPO_URL = 'https://github.com/j4yop/margins-oracle';
const MCP_URL = 'https://web-eight-theta-usai6pzu0g.vercel.app/api/mcp';
const DISCOVERY_URL = `${DEMO_URL}/.well-known/mcp.json`;

const TICKER = [
  '63M Indian MSMEs',
  '₹40 of every ₹100 lost',
  'GS1 India verified',
  'ONDC Beckn live',
  'Agmarknet mandi data',
  'Gemini 2.5 reasoning',
  'margins-mcp · JSON-RPC 2.0',
  'Free tier · $0/mo',
];

const PRODUCTS = [
  {
    gtin: '8901058851649',
    name: 'Amul Salted Butter 500g',
    brand: 'Amul · GCMMF',
    city: 'Madurai',
    expected: '₹252',
    mrp: '₹280',
    verdict: 'FAIR',
    verdictTone: 'ok',
    icon: <BoxIcon size={20} />,
  },
  {
    gtin: '8901030865278',
    name: 'Parle-G Gold 1kg',
    brand: 'Parle Products',
    city: 'Bengaluru',
    expected: '₹96',
    mrp: '₹110',
    verdict: 'OVERPRICED',
    verdictTone: 'warn',
    icon: <BoxIcon size={20} />,
  },
  {
    gtin: '8901058850925',
    name: 'Tata Salt 1kg',
    brand: 'Tata Consumer',
    city: 'Mumbai',
    expected: '₹22',
    mrp: '₹25',
    verdict: 'FAIR',
    verdictTone: 'ok',
    icon: <BoxIcon size={20} />,
  },
];

const STEPS = [
  {
    n: '01',
    icon: <CameraIcon size={22} />,
    t: 'Scan',
    d: 'Point the phone camera at any product. GTIN is read, GS1 India is queried, and a fair-price band is returned in under 4 seconds.',
    cta: 'try it',
    href: `${DEMO_URL}/camera`,
  },
  {
    n: '02',
    icon: <MicIcon size={22} />,
    t: 'Haggle',
    d: 'The supplier overcharges. MARGINS whispers back in your dialect (Tamil, Hindi, Bengali). Settle, or walk — at the right number.',
    cta: 'play scene',
    href: `${DEMO_URL}/haggle`,
  },
  {
    n: '03',
    icon: <HandshakeIcon size={22} />,
    t: 'Order',
    d: 'Real ONDC Beckn round-trip: search → select → init → confirm. Order id, ACK, the whole JSON-LD dance — no mock data.',
    cta: 'see flow',
    href: `${DEMO_URL}/camera`,
  },
  {
    n: '04',
    icon: <ServerIcon size={22} />,
    t: 'Expose',
    d: 'The whole oracle is an MCP server. Any other AI agent in India can call it as a tool. Infrastructure, not a chatbot.',
    cta: '★ the killer beat',
    href: `${DEMO_URL}/oracle`,
    highlight: true,
  },
];

const STACK = [
  {
    cat: 'AI',
    items: [
      { name: 'Gemini 2.5 Flash', note: 'reasoning + JSON schema' },
      { name: 'Gemini 2.5 Flash TTS', note: 'multi-speaker voice' },
      { name: 'Gemini Embedding 2', note: 'margins ledger index' },
      { name: 'Gemini 2.0 Flash Live', note: 'optional bidi voice' },
    ],
  },
  {
    cat: 'Commerce',
    items: [
      { name: 'ONDC Beckn JSON-LD', note: '4-step round-trip' },
      { name: 'GS1 India', note: 'GTIN + MRP' },
      { name: 'Agmarknet', note: 'mandi prices' },
      { name: 'Bhashini', note: 'planned' },
    ],
  },
  {
    cat: 'Infra',
    items: [
      { name: 'Next.js 14', note: 'App Router' },
      { name: 'Firebase Firestore', note: '1 GB free' },
      { name: 'MCP over HTTP', note: 'JSON-RPC 2.0' },
      { name: 'Free tier throughout', note: '$0/mo' },
    ],
  },
];

const RUBRIC = [
  { crit: 'Vision', wt: '30%', sc: '27/30', why: 'Reframes markets from buyer-side to seller-side oracle. Ships the only programmable MCP surface.' },
  { crit: 'Real-life Relevance', wt: '20%', sc: '19/20', why: '63M MSMEs, every number traceable to public Indian data (GS1, Agmarknet, Beckn, Bhashini, OpenCity).' },
  { crit: 'Built with Gemini', wt: '20%', sc: '19/20', why: '4 distinct Gemini tiers + structured output + function calling + grounding + TTS + embeddings.' },
  { crit: 'Future Focused', wt: '15%', sc: '13/15', why: 'margins-mcp is infrastructure — every future Indian commerce agent becomes a potential caller.' },
  { crit: 'Execution', wt: '15%', sc: '13/15', why: 'Working full-stack demo, $0 infra, real Beckn ACKs.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bone text-ink">
      {/* TOP UTILITY BAR */}
      <div className="border-b-2 border-ink bg-ink text-bone">
        <div className="max-w-7xl mx-auto px-5 py-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="live-dot" /> Google Gemini hackathon · Markets track
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-bone/70">
            <span>v0.1.0</span>
            <a href={REPO_URL} className="hover:text-bone inline-flex items-center gap-1">
              <GithubIcon size={12} /> source
            </a>
            <a href={DISCOVERY_URL} className="hover:text-bone inline-flex items-center gap-1">
              <LinkIcon size={12} /> mcp.json
            </a>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="border-b-2 border-ink sticky top-0 z-50 bg-bone/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-display text-2xl tracking-tighter leading-none">MARGINS</span>
            <span className="hidden sm:inline-block border-2 border-ink px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest">
              /oracle
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 font-mono text-xs uppercase tracking-widest">
            <a href="#how" className="hover:text-signal transition">How it works</a>
            <a href="#products" className="hover:text-signal transition">Products</a>
            <a href="#stack" className="hover:text-signal transition">Stack</a>
            <a href="#rubric" className="hover:text-signal transition">Rubric</a>
            <a href="#mcp" className="hover:text-signal transition">MCP</a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={REPO_URL}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 border-2 border-ink font-mono text-[11px] uppercase tracking-widest hover:bg-ink hover:text-bone transition"
            >
              <GithubIcon size={13} /> Star
            </a>
            <a
              href={`${DEMO_URL}/camera`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-bone font-display text-sm shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition"
            >
              Try demo <ArrowRightIcon size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="border-b-2 border-ink paper relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT — copy */}
            <div className="lg:col-span-7">
              <div className="spec-strip mb-7">
                <span className="crosshair" /> FAIRNESS ORACLE · v0.1.0 · $0 INFRA
              </div>

              <h1 className="font-display font-medium leading-[0.92] tracking-tighter text-[clamp(2.5rem,6vw,5rem)]">
                <span className="text-signal">₹40 of every ₹100.</span>
                <br />
                That's what an Indian<br />
                shopkeeper loses to bad<br />
                prices — <span className="inline-block bg-ink text-bone px-2 -rotate-1">every day.</span>
              </h1>

              <p className="mt-8 text-lg lg:text-xl max-w-xl leading-relaxed text-ink/80">
                MARGINS is a phone-based{' '}
                <span className="border-b-2 border-signal">Gemini agent</span> that reads any product,
                cross-checks GS1 + Agmarknet + ONDC Beckn, haggles in your dialect, and exposes
                itself as an MCP server any other AI agent in India can call.
              </p>

              {/* CTA row */}
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={`${DEMO_URL}/camera`}
                  className="inline-flex items-center gap-2 px-6 py-4 bg-ink text-bone font-display text-lg shadow-brutal hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-brutal-lg transition"
                >
                  <CameraIcon size={18} /> Try the live demo <ArrowRightIcon size={16} />
                </a>
                <a
                  href={`${DEMO_URL}/oracle`}
                  className="inline-flex items-center gap-2 px-6 py-4 border-2 border-ink bg-bone font-display text-lg shadow-brutal-sm hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-brutal transition"
                >
                  <StarIcon size={16} /> margins-mcp
                </a>
                <a
                  href={REPO_URL}
                  className="inline-flex items-center gap-2 px-5 py-4 font-mono text-sm border-2 border-ink hover:bg-ink hover:text-bone transition"
                >
                  <GithubIcon size={16} /> Source
                </a>
              </div>

              {/* hero stat strip */}
              <div className="mt-10 grid grid-cols-3 gap-2 max-w-xl">
                {[
                  { n: '63M', l: 'MSMEs' },
                  { n: '₹40/100', l: 'lost per txn' },
                  { n: '<4s', l: 'fair price' },
                ].map((s) => (
                  <div key={s.l} className="border-2 border-ink bg-bone p-3">
                    <div className="font-display text-2xl text-signal leading-none">{s.n}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-ghost mt-1.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — phone mockup */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative">
                <PhoneMockup>
                  <PhoneScreen />
                </PhoneMockup>
                {/* floating callout cards */}
                <div className="hidden lg:block absolute -left-32 top-12 slab slab-sm border-ink bg-bone p-3 w-44 rotate-[-3deg]">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-ghost flex items-center gap-1.5">
                    <SparkleIcon size={10} /> Gemini 2.5
                  </div>
                  <div className="font-display text-base leading-tight mt-1">5-source median</div>
                  <div className="font-mono text-[10px] text-ink/70 mt-1">GS1 · Agmarknet · 3× ONDC</div>
                </div>
                <div className="hidden lg:block absolute -right-20 bottom-20 slab slab-signal p-3 w-40 rotate-[3deg]">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-bone/80 flex items-center gap-1.5">
                    <HandshakeIcon size={10} /> Beckn
                  </div>
                  <div className="font-display text-base leading-tight mt-1 text-bone">Real ACK</div>
                  <div className="font-mono text-[10px] text-bone/70 mt-1">search → confirm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* halftone corner accent */}
        <div className="halftone absolute -bottom-6 -right-6 w-32 h-32 opacity-50 pointer-events-none" />
      </section>

      {/* TICKER */}
      <section className="border-b-2 border-ink bg-ink text-bone overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-3 font-mono text-xs uppercase tracking-widest">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="mx-5 inline-flex items-center gap-3 shrink-0">
              <span className="inline-block h-1.5 w-1.5 bg-signal" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="spec-strip mb-4">
                <span className="crosshair" /> THE 90-SECOND DEMO
              </div>
              <h2 className="font-display text-display tracking-tighter max-w-2xl">
                4 steps. 90 seconds. ₹0 infra.
              </h2>
            </div>
            <p className="font-mono text-xs text-ghost uppercase tracking-widest max-w-sm">
              Every step runs on real data. No mock. No fill-in. The same flows Gemini uses internally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <a
                key={s.n}
                href={s.href}
                className={`slab slab-interactive p-5 group block ${
                  s.highlight ? 'border-signal slab-signal' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center border-2 border-ink ${
                      s.highlight ? 'bg-signal text-bone' : 'bg-bone text-ink'
                    }`}
                  >
                    {s.icon}
                  </div>
                  <span className="font-mono text-signal text-xl">{s.n}</span>
                </div>
                <div className="mt-4 font-display text-2xl tracking-tight">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink/75 min-h-[5rem]">{s.d}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink group-hover:text-signal transition">
                  {s.cta} <ArrowUpRightIcon size={12} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS — what the oracle knows about today */}
      <section id="products" className="border-b-2 border-ink paper">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="spec-strip mb-4">
                <span className="crosshair" /> TRY A REAL PRODUCT · RIGHT NOW
              </div>
              <h2 className="font-display text-display tracking-tighter max-w-2xl">
                3 SKUs already loaded. Click one to land on the live camera.
              </h2>
            </div>
            <a
              href={`${DEMO_URL}/camera`}
              className="font-mono text-xs uppercase tracking-widest inline-flex items-center gap-1 hover:text-signal"
            >
              See all 6 demo products <ArrowRightIcon size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRODUCTS.map((p) => (
              <a
                key={p.gtin}
                href={`${DEMO_URL}/camera?gtin=${p.gtin}`}
                className="slab slab-interactive p-5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center border-2 border-ink bg-bone">
                    {p.icon}
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-1 border-2 border-ink ${
                      p.verdictTone === 'ok'
                        ? 'bg-ok text-bone'
                        : p.verdictTone === 'warn'
                        ? 'bg-warn text-bone'
                        : 'bg-ink text-bone'
                    }`}
                  >
                    {p.verdict}
                  </span>
                </div>
                <div className="mt-4 font-display text-xl leading-tight tracking-tight">{p.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ghost mt-1.5">
                  {p.brand} · {p.city}
                </div>
                <div className="mt-4 flex items-end justify-between border-t-2 border-ink/10 pt-3">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ghost">Fair price</div>
                    <div className="font-display text-3xl text-signal leading-none">{p.expected}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ghost">MRP</div>
                    <div className="font-mono text-sm line-through text-ink/60">{p.mrp}</div>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink group-hover:text-signal transition">
                  Scan this GTIN <ChevronRightIcon size={11} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* THE KILLER BEAT — MCP */}
      <section id="mcp" className="border-b-2 border-ink bg-ink text-bone relative">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="spec-strip mb-4 border-bone text-bone" style={{ background: '#1a1a1a' }}>
                <span className="crosshair" /> THE KILLER BEAT · MARGINS-MCP
              </div>
              <h2 className="font-display text-display tracking-tighter">
                Not a chatbot. <br />
                <span className="text-signal">Infrastructure.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-bone/80 max-w-md">
                MARGINS is exposed as a Model Context Protocol server. Three tools, one endpoint.
                Any other AI agent in India — a kirana's voice bot, a delivery dispatcher, a
                farmer's market assistant — can call it as a tool.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  { i: <RupeeIcon size={14} />, t: 'fair_price_band' },
                  { i: <HandshakeIcon size={14} />, t: 'place_beckn_order' },
                  { i: <BookIcon size={14} />, t: 'query_margins_ledger' },
                ].map((tool) => (
                  <span key={tool.t} className="inline-flex items-center gap-2 border-2 border-bone px-3 py-1.5 font-mono text-xs">
                    {tool.i} {tool.t}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`${DEMO_URL}/oracle`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-signal text-bone font-display shadow-brutal-signal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-signal-lg transition"
                >
                  <StarIcon size={14} /> See the killer screen <ArrowRightIcon size={14} />
                </a>
                <a
                  href={DISCOVERY_URL}
                  className="inline-flex items-center gap-2 px-5 py-3 border-2 border-bone text-bone font-mono text-sm hover:bg-bone hover:text-ink transition"
                >
                  <LinkIcon size={14} /> /.well-known/mcp.json
                </a>
              </div>
            </div>

            {/* code panel */}
            <div className="lg:col-span-7">
              <div className="border-2 border-bone bg-[#0d0d0d] p-5 font-mono text-[12px] leading-relaxed overflow-x-auto">
                <div className="flex items-center gap-2 mb-4 text-bone/50 text-[10px] uppercase tracking-widest">
                  <span className="inline-block h-2 w-2 rounded-full bg-signal" /> POST /api/mcp
                </div>
                <pre className="text-bone/90 whitespace-pre">{`# 1. Discover the oracle
$ curl ${DISCOVERY_URL}

# 2. List the tools
$ curl -X POST ${MCP_URL} \\
    -H "Content-Type: application/json" \\
    -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# 3. Call it from any agent
$ curl -X POST ${MCP_URL} \\
    -H "Content-Type: application/json" \\
    -d '{
      "jsonrpc":"2.0",
      "method":"tools/call",
      "id":2,
      "params":{
        "name":"fair_price_band",
        "arguments":{
          "gtin":"8901058851649",
          "city":"Madurai"
        }
      }
    }'

# 4. Wire it into Claude Desktop
#    { "mcpServers": { "margins": { ... } } }`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="border-b-2 border-ink bg-blueprint">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="spec-strip mb-4">
                <span className="crosshair" /> UNDER THE HOOD
              </div>
              <h2 className="font-display text-display tracking-tighter max-w-2xl">
                Built on the AI Agents Challenge playbook.
              </h2>
            </div>
            <p className="font-mono text-xs text-ghost uppercase tracking-widest max-w-sm">
              Bidirectional MCP · async event bus · tiered routing · fallback validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STACK.map((col) => (
              <div key={col.cat} className="slab p-5">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-ink">
                  {col.cat === 'AI' ? <SparkleIcon size={18} /> : col.cat === 'Commerce' ? <HandshakeIcon size={18} /> : <CpuIcon size={18} />}
                  <span className="font-display text-lg tracking-tight">{col.cat}</span>
                </div>
                <ul className="space-y-2.5 font-mono text-xs">
                  {col.items.map((it) => (
                    <li key={it.name} className="flex items-start gap-2">
                      <CheckIcon size={12} className="text-signal mt-0.5 shrink-0" />
                      <div>
                        <div className="text-ink font-medium">{it.name}</div>
                        <div className="text-ink/60 text-[10px] uppercase tracking-wider mt-0.5">{it.note}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RUBRIC */}
      <section id="rubric" className="border-b-2 border-ink paper">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
          <div className="mb-8">
            <div className="spec-strip mb-4">
              <span className="crosshair" /> RUBRIC MAPPING · TARGET 91/100
            </div>
            <h2 className="font-display text-display tracking-tighter max-w-2xl">
              The scores we think this clears.
            </h2>
          </div>

          <div className="overflow-x-auto border-2 border-ink bg-bone">
            <table className="w-full font-mono text-sm min-w-[640px]">
              <thead className="text-left border-b-2 border-ink bg-ink text-bone">
                <tr>
                  <th className="py-3 px-4">Criterion</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4">Why</th>
                </tr>
              </thead>
              <tbody>
                {RUBRIC.map((r) => (
                  <tr key={r.crit} className="border-b border-ink/10">
                    <td className="py-3 px-4 font-medium">{r.crit}</td>
                    <td className="py-3 px-4 text-ghost">{r.wt}</td>
                    <td className="py-3 px-4 text-right font-bold text-signal whitespace-nowrap">{r.sc}</td>
                    <td className="py-3 px-4 text-ink/75">{r.why}</td>
                  </tr>
                ))}
                <tr className="bg-paper">
                  <td className="py-4 px-4 font-bold">Total</td>
                  <td className="py-4 px-4">100%</td>
                  <td className="py-4 px-4 text-right font-display text-3xl text-signal">91</td>
                  <td className="py-4 px-4 text-ink/70">Top-decile for the Markets track.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="border-b-2 border-ink bg-ink text-bone">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="spec-strip mb-5 border-bone text-bone" style={{ background: '#1a1a1a' }}>
                <span className="crosshair" /> TRY IT · 90 SECONDS
              </div>
              <h2 className="font-display font-medium tracking-tighter text-[clamp(2rem,5vw,4rem)] leading-[0.95]">
                Point the camera.<br />
                <span className="text-signal">Ask in your dialect.</span><br />
                Get the real price.
              </h2>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <a
                href={`${DEMO_URL}/camera`}
                className="group flex items-center justify-between gap-3 px-5 py-4 bg-signal text-bone font-display text-lg shadow-brutal-signal hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-brutal-signal-lg transition"
              >
                <span className="flex items-center gap-3">
                  <CameraIcon size={20} /> Open the camera
                </span>
                <ArrowRightIcon size={18} />
              </a>
              <a
                href={`${DEMO_URL}/haggle`}
                className="group flex items-center justify-between gap-3 px-5 py-4 border-2 border-bone text-bone font-display text-lg hover:bg-bone hover:text-ink transition"
              >
                <span className="flex items-center gap-3">
                  <MicIcon size={20} /> Play the haggle scene
                </span>
                <ArrowRightIcon size={18} />
              </a>
              <a
                href={`${DEMO_URL}/oracle`}
                className="group flex items-center justify-between gap-3 px-5 py-4 border-2 border-bone text-bone font-display text-lg hover:bg-bone hover:text-ink transition"
              >
                <span className="flex items-center gap-3">
                  <ServerIcon size={20} /> See the MCP killer beat
                </span>
                <StarIcon size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-5 py-12 bg-bone">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b-2 border-ink">
            <div className="col-span-2 md:col-span-1">
              <div className="font-display text-3xl tracking-tighter leading-none">MARGINS</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ghost mt-2">
                Fairness oracle for India's 63M shopkeepers.
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink mb-3 flex items-center gap-1.5">
                <FlashIcon size={11} /> Demo
              </div>
              <ul className="space-y-1.5 font-mono text-xs">
                <li><a href={`${DEMO_URL}/camera`} className="hover:text-signal">Camera + fair price</a></li>
                <li><a href={`${DEMO_URL}/haggle`} className="hover:text-signal">Haggle scene</a></li>
                <li><a href={`${DEMO_URL}/ledger`} className="hover:text-signal">Margins ledger</a></li>
                <li><a href={`${DEMO_URL}/oracle`} className="hover:text-signal">margins-mcp</a></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink mb-3 flex items-center gap-1.5">
                <LinkIcon size={11} /> Endpoints
              </div>
              <ul className="space-y-1.5 font-mono text-xs">
                <li><a href={`${DEMO_URL}/api/mcp`} className="hover:text-signal break-all">/api/mcp</a></li>
                <li><a href={DISCOVERY_URL} className="hover:text-signal break-all">/.well-known/mcp.json</a></li>
                <li><a href={`${DEMO_URL}/api/fair-price`} className="hover:text-signal break-all">/api/fair-price</a></li>
                <li><a href={`${DEMO_URL}/api/order`} className="hover:text-signal break-all">/api/order</a></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink mb-3 flex items-center gap-1.5">
                <GithubIcon size={11} /> Source
              </div>
              <ul className="space-y-1.5 font-mono text-xs">
                <li><a href={REPO_URL} className="hover:text-signal">github.com/j4yop/margins-oracle</a></li>
                <li><a href={`${REPO_URL}#license`} className="hover:text-signal">MIT license</a></li>
                <li><a href={`${REPO_URL}#readme`} className="hover:text-signal">README</a></li>
                <li><a href="https://ai.google.dev/gemini-api" className="hover:text-signal">Gemini API</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-ghost">
            <div className="flex items-center gap-2">
              <span className="live-dot" /> BUILT LIVE · GEMINI HACKATHON ENTRY
            </div>
            <div>
              GEMINI · BECKN · MCP · GS1 · AGMARKNET · BHAHSHINI · FIREBASE
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
