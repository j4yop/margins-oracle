import Link from 'next/link';
import PhoneMockup from '@/components/PhoneMockup';
import PhoneScreen from '@/components/PhoneScreen';
import PriceInspector from '@/components/PriceInspector';
import McpTabs from '@/components/McpTabs';
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
  FileTextIcon,
  ShieldCheckIcon,
  MessageSquareIcon,
} from '@/components/Icons';

const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL || 'https://margins-oracle-web.vercel.app';
const REPO_URL = 'https://github.com/j4yop/margins-oracle';
const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://margins-oracle-web.vercel.app/api/mcp';
const DISCOVERY_URL = `${DEMO_URL}/.well-known/mcp.json`;

const TICKER = [
  '63M Indian Kirana MSMEs',
  'Dual-Mode Intake: Barcode + Handwritten Parchi',
  '₹40 of every ₹100 margin recovered',
  'GS1 India verified GTIN-13',
  'ONDC Beckn live JSON-LD ACKs',
  'Multilingual Gemini Audio TTS (Hindi · Tamil · Bengali)',
  'Gemini 2.5 Flash Multimodal Vision',
  'margins-mcp · JSON-RPC 2.0 open protocol',
  'Free tier · $0/mo serverless footprint',
];

const STEPS = [
  {
    n: '01',
    icon: <CameraIcon size={24} />,
    title: 'Dual-Mode Intake',
    subtitle: 'GTIN Barcode + Parchi OCR',
    description:
      'Point your phone camera at standard packaged GTIN barcodes, or snap a photo of handwritten crumpled delivery invoices (parchis) for instant Gemini 2.5 Flash multimodal audit.',
    badge: 'Stage 01',
    cta: 'Try Scanner',
    href: `${DEMO_URL}/camera`,
  },
  {
    n: '02',
    icon: <ShieldCheckIcon size={24} />,
    title: 'Real-Time Mandi Oracle',
    subtitle: 'GS1 India + Agmarknet Benchmarks',
    description:
      'Within 4 seconds, MARGINS validates product authenticity against GS1 India and cross-references daily Agmarknet regional mandi price bands to reveal true wholesale costs.',
    badge: 'Stage 02',
    cta: 'Inspect Benchmarks',
    href: `${DEMO_URL}/camera`,
  },
  {
    n: '03',
    icon: <MicIcon size={24} />,
    title: 'Voice Haggle & Udhaar',
    subtitle: 'Dialect-Specific Negotiation Audio',
    description:
      'Distributor truck overcharging? MARGINS calculates credit terms (udhaar) leverage and whispers sharp counter-arguments in Hindi, Tamil, or Bengali with Gemini Audio TTS.',
    badge: 'Stage 03',
    cta: 'Play Voice Demo',
    href: `${DEMO_URL}/haggle`,
  },
  {
    n: '04',
    icon: <ServerIcon size={24} />,
    title: 'Open Beckn & MCP Rail',
    subtitle: 'Ed25519 ONDC Orders + MCP Server',
    description:
      'Place 4-step ONDC orders directly with cryptographic Ed25519 signatures, or let Claude Desktop and AI agents invoke the oracle over standard JSON-RPC 2.0.',
    badge: 'Stage 04',
    cta: 'Open MCP Specs',
    href: `${DEMO_URL}/oracle`,
    highlight: true,
  },
];

const STACK = [
  {
    cat: 'Gemini AI Tier',
    icon: <SparkleIcon size={20} />,
    items: [
      { name: 'Gemini 2.5 Flash', note: 'Multimodal vision for barcode targeting & crumpled invoice OCR' },
      { name: 'Gemini Flash Audio TTS', note: 'Dialect speech synthesis in Hindi, Tamil, and Bengali' },
      { name: 'Gemini Embedding 2', note: 'Semantic vector matching across regional kirana ledger items' },
      { name: 'Structured Outputs', note: 'Strict JSON schema adherence for instant UI and protocol binding' },
    ],
  },
  {
    cat: 'Open Commerce Rails',
    icon: <HandshakeIcon size={20} />,
    items: [
      { name: 'ONDC Beckn Protocol', note: 'Ed25519 auth headers & 4-step BAP/BPP order round-trip' },
      { name: 'GS1 India DataKart', note: 'Authoritative GTIN-13 product, manufacturer, and MRP verification' },
      { name: 'Agmarknet Mandi Feed', note: 'Real-time regional wholesale price bands from APMC mandis' },
      { name: 'Parchi Auditor', note: 'Automated discrepancy detection and 1-tap WhatsApp dispute notes' },
    ],
  },
  {
    cat: 'Serverless Infrastructure',
    icon: <CpuIcon size={20} />,
    items: [
      { name: 'Next.js 14 App Router', note: 'High-performance mobile PWA architecture hosted on Vercel' },
      { name: 'Firebase Firestore', note: 'Real-time ledger transactions and merchant audit records' },
      { name: 'Model Context Protocol', note: 'Bidirectional JSON-RPC 2.0 server exposed at /api/mcp' },
      { name: '$0 / Month Cloud Cost', note: 'Engineered entirely within free-tier serverless limits' },
    ],
  },
];

const CAPABILITIES = [
  {
    dimension: 'Merchant Procurement Oracle',
    layer: 'Architecture',
    status: 'Verified',
    rationale:
      'Reframes retail AI from consumer chatbots to an active merchant-side wholesale intelligence and procurement oracle with programmable MCP tools.',
  },
  {
    dimension: 'FMCG Trade Economics',
    layer: 'Data Rails',
    status: 'Verified',
    rationale:
      'Directly tackles the ₹45,000 Cr trade spend opacity across 63M MSMEs with dual-mode intake (barcodes & paper parchis) and 1-tap dispute rails.',
  },
  {
    dimension: 'Multimodal Multilingual AI',
    layer: 'Gemini 2.5',
    status: 'Verified',
    rationale:
      'Multimodal Gemini 2.5 Flash handles crumpled handwriting OCR and pricing logic, while Gemini Audio TTS whispers vernacular negotiation counter-arguments.',
  },
  {
    dimension: 'Open Protocol Interoperability',
    layer: 'Beckn & MCP',
    status: 'Verified',
    rationale:
      'margins-mcp exports essential agentic commerce tools (fair_price_band, audit_parchi_invoice) that any AI assistant or ERP can invoke via JSON-RPC 2.0.',
  },
  {
    dimension: 'Production Reliability',
    layer: 'Serverless Edge',
    status: 'Verified',
    rationale:
      'Zero mock dependencies for core OCR and Beckn quotation discovery, cryptographic Ed25519 signing, and automated fallback logic.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <strong className="text-orange-400 font-bold uppercase tracking-wider">
                Autonomous Retail Intelligence
              </strong>
              <span className="hidden sm:inline text-slate-400">· Open Commerce Rail</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
              Dual-Mode Intake + MCP Server
            </span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white inline-flex items-center gap-1.5 transition"
            >
              <GithubIcon size={13} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href={DISCOVERY_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white inline-flex items-center gap-1.5 transition"
            >
              <LinkIcon size={13} />
              <span className="hidden sm:inline">mcp.json</span>
            </a>
          </div>
        </div>
      </div>

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                  MARGINS
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                  oracle
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-mono text-slate-500 -mt-0.5">
                Fairness Oracle for 63M Shopkeepers
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 font-sans text-xs font-semibold text-slate-600 tracking-wide">
            <a href="#how" className="hover:text-orange-600 transition">How It Works</a>
            <a href="#simulator" className="hover:text-orange-600 transition">Live Simulator</a>
            <a href="#story" className="hover:text-orange-600 transition">Kirana Story</a>
            <a href="#mcp" className="hover:text-orange-600 transition">MCP Server</a>
            <a href="#stack" className="hover:text-orange-600 transition">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs font-medium transition shadow-subtle"
            >
              <GithubIcon size={14} /> Star on GitHub
            </a>
            <a
              href={`${DEMO_URL}/camera`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs sm:text-sm font-bold shadow-md transition-all hover:-translate-y-0.5"
            >
              Launch Live App <ArrowRightIcon size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-mono font-medium mb-6">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span>FAIRNESS ORACLE · DUAL-MODE VISION · $0 INFRA</span>
              </div>

              <h1 className="font-display font-extrabold text-slate-950 tracking-tight text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.04]">
                Stop losing{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  ₹40 of every ₹100.
                </span>
                <br />
                The Wholesale Fairness Oracle for India&apos;s 63M Kiranas.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Indian retail distributors routinely exploit opacity and informal credit.
                <strong className="text-slate-900 font-semibold"> MARGINS</strong> scans GTIN barcodes and handwritten paper invoices (<em>parchis</em>), calculates fair wholesale bands via GS1 & Agmarknet, whispers dialect counter-arguments, and orders directly on ONDC.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3.5 items-center">
                <a
                  href={`${DEMO_URL}/camera`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-sans text-base font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all hover:-translate-y-0.5"
                >
                  <CameraIcon size={18} /> Launch Mobile Scanner <ArrowRightIcon size={16} />
                </a>
                <a
                  href={`${DEMO_URL}/haggle`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-sans text-base font-semibold shadow-subtle hover:border-slate-400 transition-all hover:-translate-y-0.5"
                >
                  <MicIcon size={18} className="text-orange-500" /> Try Voice Haggle
                </a>
                <a
                  href="#mcp"
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl text-slate-600 hover:text-slate-900 font-mono text-xs uppercase tracking-wider font-semibold transition"
                >
                  <ServerIcon size={16} /> MCP Protocol
                </a>
              </div>

              {/* Trust Metric Bentos */}
              <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-subtle">
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-orange-600 leading-none">
                    63M
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1.5 font-medium">
                    Indian MSMEs
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-subtle">
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600 leading-none">
                    ₹40/₹100
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1.5 font-medium">
                    Margin Recovered
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-subtle">
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                    &lt; 4s
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1.5 font-medium">
                    Fair Price Band
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Column — Phone Mockup with Radiant Accents */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-[310px] sm:w-[330px]">
                {/* Background ambient glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-orange-400/20 to-amber-300/20 rounded-[60px] blur-2xl -z-10" />

                <PhoneMockup>
                  <PhoneScreen />
                </PhoneMockup>

                {/* Floating Insight Pill 1 (Left) */}
                <div className="hidden xl:flex absolute -left-20 top-16 slab slab-sm p-3 w-44 rotate-[-3deg] border border-slate-200 shadow-elevated bg-white/95 backdrop-blur items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                    <ScanIcon size={16} />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase font-bold text-orange-600 tracking-wider">
                      Dual-Mode Vision
                    </div>
                    <div className="font-sans font-bold text-xs text-slate-900 leading-tight mt-0.5">
                      Barcode & Invoice OCR
                    </div>
                  </div>
                </div>

                {/* Floating Insight Pill 2 (Right) */}
                <div className="hidden xl:flex absolute -right-16 bottom-24 slab slab-sm p-3 w-40 rotate-[3deg] border border-emerald-200 shadow-elevated bg-white/95 backdrop-blur items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <HandshakeIcon size={16} />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase font-bold text-emerald-600 tracking-wider">
                      Beckn Protocol
                    </div>
                    <div className="font-sans font-bold text-xs text-slate-900 leading-tight mt-0.5">
                      Ed25519 Live ACK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <section className="bg-slate-900 text-white border-y border-slate-800 overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap font-mono text-xs uppercase tracking-widest">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="mx-6 inline-flex items-center gap-3 shrink-0 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* INTERACTIVE PRICE INSPECTOR SIMULATOR */}
      <section id="simulator" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="spec-strip mb-3.5">
              <span>LIVE INTERACTIVE SIMULATOR</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight">
              Test authentic SKUs &amp; handwritten parchis.
            </h2>
          </div>
          <p className="font-sans text-sm text-slate-600 max-w-md leading-relaxed">
            Switch between FMCG products and crumpled invoices. See real wholesale prices, margin recovery per carton, and AI dialect counter-arguments.
          </p>
        </div>

        <PriceInspector demoUrl={DEMO_URL} />
      </section>

      {/* HOW IT WORKS SECTION — 4 STAGE BENTO */}
      <section id="how" className="py-16 lg:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <div className="spec-strip mb-3.5">
                <span>THE COMPLETE 4-STAGE ARCHITECTURE</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight">
                From barcode to Beckn order in 4 autonomous steps.
              </h2>
            </div>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-wider max-w-md">
              Powered by Google Gemini 2.5 Flash, GS1 India registry, Agmarknet wholesale feeds, and ONDC open commerce rails.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <a
                key={s.n}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={`slab slab-interactive p-6 flex flex-col justify-between group ${
                  s.highlight ? 'border-orange-300 ring-1 ring-orange-400/30' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                        s.highlight
                          ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-400'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      {s.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-orange-600 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display font-bold text-xl text-slate-900 tracking-tight">
                    {s.title}
                  </h3>
                  <div className="text-xs font-mono font-medium text-orange-600 mt-0.5">
                    {s.subtitle}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-xs uppercase tracking-wider font-semibold text-slate-700 group-hover:text-orange-600 transition">
                  <span>{s.cta}</span>
                  <ArrowUpRightIcon
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* REAL KIRANA CASE STUDY */}
      <section id="story" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="spec-strip mb-4">
                <span>CASE STUDY · RAJAJINAGAR, BENGALURU</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
                How Amar saved ₹1,840 on a single Tuesday delivery restock.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Amar runs an independent 450 sq.ft. provision store in Bengaluru. When his FMCG distributor dropped off a delivery with a handwritten parchi bill of ₹38,400, Amar scanned the crumpled receipt using MARGINS.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <div className="font-mono text-[10px] uppercase font-bold text-slate-400">Parchi Audit Time</div>
                  <div className="font-display font-extrabold text-2xl text-slate-900 mt-1">2.4s</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <div className="font-mono text-[10px] uppercase font-bold text-slate-400">Scheme Leakage</div>
                  <div className="font-display font-extrabold text-2xl text-amber-600 mt-1">3 SKUs</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 ring-1 ring-emerald-300/40">
                  <div className="font-mono text-[10px] uppercase font-bold text-emerald-700">Immediate Credit</div>
                  <div className="font-display font-extrabold text-2xl text-emerald-600 mt-1">₹1,840</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-subtle">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  AK
                </div>
                <div>
                  <div className="font-sans font-bold text-sm text-slate-900">Amar&apos;s Kirana Store</div>
                  <div className="font-mono text-xs text-slate-500">Rajajinagar 3rd Block, Bengaluru</div>
                </div>
              </div>

              <blockquote className="mt-4 text-sm text-slate-700 italic leading-relaxed">
                &ldquo;Distributors always say &apos;rates have gone up this week&apos;. With MARGINS, I pointed my camera at the parchi, and within 3 seconds it highlighted that the oil distributor withheld the official 6% seasonal discount. I played the Hindi audio counter-argument, and he immediately gave me a ₹1,840 UPI credit.&rdquo;
              </blockquote>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Verified On-Device Audit
                </span>
                <span>Firestore Ledger #4092</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE KILLER BEAT: MCP SERVER INFRASTRUCTURE */}
      <section id="mcp" className="py-16 lg:py-24 bg-slate-900 text-white border-y border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-orange-400 text-xs font-mono font-medium mb-6">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span>ARCHITECTURAL MASTERSTROKE · MARGINS-MCP</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                Not just another chat interface.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Open Commerce Infrastructure.
                </span>
              </h2>

              <p className="mt-5 text-base text-slate-300 leading-relaxed">
                MARGINS is a fully compliant Model Context Protocol (MCP) server. Any enterprise AI, kirana voice bot, logistics dispatcher, Claude Desktop, or Cursor IDE in India can call MARGINS directly via standard JSON-RPC 2.0.
              </p>

              <div className="mt-6 space-y-2">
                {[
                  { name: 'fair_price_band', desc: 'Queries GS1 & Agmarknet to calculate median fair prices.' },
                  { name: 'audit_parchi_invoice', desc: 'Runs Gemini 2.5 Multimodal OCR to audit crumpled delivery bills.' },
                  { name: 'place_beckn_order', desc: 'Dispatches real 4-step Beckn search-select-init-confirm orders.' },
                  { name: 'query_margins_ledger', desc: 'Reads verified store transaction history and savings ledger.' },
                ].map((t) => (
                  <div key={t.name} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col">
                    <span className="font-mono text-xs font-bold text-orange-400">
                      tool: {t.name}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {t.desc}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <a
                  href={`${DEMO_URL}/oracle`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-sans text-sm font-bold shadow-md transition"
                >
                  <StarIcon size={15} /> Open MCP Web Console <ArrowRightIcon size={14} />
                </a>
                <a
                  href={DISCOVERY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium transition"
                >
                  <LinkIcon size={14} /> /.well-known/mcp.json
                </a>
              </div>
            </div>

            {/* Interactive McpTabs Window */}
            <div className="lg:col-span-7">
              <McpTabs mcpUrl={MCP_URL} discoveryUrl={DISCOVERY_URL} />
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL STACK ARCHITECTURE */}
      <section id="stack" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="spec-strip mb-3.5">
              <span>STACK ARCHITECTURE</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight">
              Production-grade. Zero fluff.
            </h2>
          </div>
          <p className="font-mono text-xs text-slate-500 uppercase tracking-wider max-w-md">
            Engineered with strict TypeScript, Google Generative AI SDK, Beckn cryptographic signatures, and serverless edge delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STACK.map((col) => (
            <div key={col.cat} className="slab p-6 sm:p-7">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                  {col.icon}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">
                  {col.cat}
                </h3>
              </div>

              <ul className="space-y-4">
                {col.items.map((it) => (
                  <li key={it.name} className="flex items-start gap-2.5">
                    <CheckIcon size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {it.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {it.note}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ENTERPRISE CAPABILITY MATRIX */}
      <section id="capabilities" className="py-16 lg:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <div className="spec-strip mb-3.5">
              <span>ENTERPRISE CAPABILITY MATRIX</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight">
              Operational Reliability &amp; Verification
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Rigorous multi-layer verification spanning vision OCR, trade scheme auditing, Beckn discovery, and programmable MCP agent rails.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-subtle">
            <table className="w-full font-sans text-xs sm:text-sm min-w-[680px]">
              <thead className="text-left bg-slate-900 text-white font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Dimension</th>
                  <th className="py-3.5 px-4">Layer / Scope</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                  <th className="py-3.5 px-5">Architectural Rationale &amp; Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CAPABILITIES.map((r) => (
                  <tr key={r.dimension} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {r.dimension}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                      {r.layer}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      {r.status}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 leading-relaxed">
                      {r.rationale}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50/60 font-bold border-t-2 border-emerald-200">
                  <td className="py-4 px-5 text-base text-slate-900">
                    Composite Verification
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-600">
                    Full Protocol Coverage
                  </td>
                  <td className="py-4 px-4 text-right font-display text-base text-emerald-700">
                    Production Ready
                  </td>
                  <td className="py-4 px-5 text-xs text-slate-700 font-semibold">
                    Zero mock dependencies required for core invoice OCR, scheme auditing, and Beckn quotation discovery.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CLOSING CALL TO ACTION */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-orange-400 text-xs font-mono font-medium mb-5">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span>EXPERIENCE THE LIVE APP · ZERO INSTALL NEEDED</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-[1.05]">
                Empower your local kirana.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Reclaim honest trade margins.
                </span>
              </h2>
              <p className="mt-4 text-base text-slate-300 max-w-lg leading-relaxed">
                Scan barcodes, audit handwritten paper delivery invoices, negotiate in your mother tongue, and transact autonomously on India&apos;s open rails.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3.5">
              <a
                href={`${DEMO_URL}/camera`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-sans font-bold text-base shadow-lg shadow-orange-500/25 transition group hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-3">
                  <CameraIcon size={20} /> Open Mobile Scanner
                </span>
                <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href={`${DEMO_URL}/haggle`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white font-sans font-bold text-base transition group hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-3">
                  <MicIcon size={20} className="text-orange-400" /> Play Voice Haggle Scene
                </span>
                <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href={`${DEMO_URL}/oracle`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white font-sans font-bold text-base transition group hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-3">
                  <ServerIcon size={20} className="text-orange-400" /> MCP Developer Console
                </span>
                <StarIcon size={18} className="text-amber-400" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-orange-600 text-white font-display font-bold flex items-center justify-center text-sm">
                  M
                </div>
                <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                  MARGINS
                </span>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-2 leading-relaxed">
                Fairness oracle for India&apos;s 63M shopkeepers. Autonomous retail intelligence platform.
              </p>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-900 font-bold mb-3 flex items-center gap-1.5">
                <FlashIcon size={12} className="text-orange-500" /> Mobile App
              </div>
              <ul className="space-y-2 font-mono text-xs text-slate-600">
                <li><a href={`${DEMO_URL}/camera`} className="hover:text-orange-600 transition">Camera Scanner</a></li>
                <li><a href={`${DEMO_URL}/haggle`} className="hover:text-orange-600 transition">Haggle &amp; Udhaar</a></li>
                <li><a href={`${DEMO_URL}/ledger`} className="hover:text-orange-600 transition">Margins Ledger</a></li>
                <li><a href={`${DEMO_URL}/oracle`} className="hover:text-orange-600 transition">MCP Server</a></li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-900 font-bold mb-3 flex items-center gap-1.5">
                <LinkIcon size={12} className="text-orange-500" /> Endpoints
              </div>
              <ul className="space-y-2 font-mono text-xs text-slate-600">
                <li><a href={`${DEMO_URL}/api/mcp`} className="hover:text-orange-600 transition">/api/mcp (JSON-RPC)</a></li>
                <li><a href={DISCOVERY_URL} className="hover:text-orange-600 transition">/.well-known/mcp.json</a></li>
                <li><a href={`${DEMO_URL}/api/fair-price`} className="hover:text-orange-600 transition">/api/fair-price</a></li>
                <li><a href={`${DEMO_URL}/api/audit/invoice`} className="hover:text-orange-600 transition">/api/audit/invoice</a></li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-900 font-bold mb-3 flex items-center gap-1.5">
                <GithubIcon size={12} className="text-orange-500" /> Open Source
              </div>
              <ul className="space-y-2 font-mono text-xs text-slate-600">
                <li><a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-orange-600 transition">GitHub Repository</a></li>
                <li><a href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer" className="hover:text-orange-600 transition">System Architecture</a></li>
                <li><a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="hover:text-orange-600 transition">MIT License</a></li>
                <li><a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="hover:text-orange-600 transition">Google Gemini AI</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>AUTONOMOUS WHOLESALE FAIRNESS ORACLE · OPEN COMMERCE RAIL</span>
            </div>
            <div>
              GEMINI 2.5 FLASH · ONDC BECKN · MCP · GS1 INDIA · AGMARKNET · FIRESTORE
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
