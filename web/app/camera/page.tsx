'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DEMO_PRODUCTS } from '@/lib/demo-products';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

type FairPrice = {
  product: { gtin: string; name: string; brand?: string; mrp?: number };
  fairPriceBand: { low?: number; median: number; high?: number; currency: string };
  verdict: 'fair' | 'overpriced' | 'underpriced' | 'insufficient_data';
  confidence: number;
  sources: { name: string; price?: number; url?: string }[];
  reasoning: string;
  hagglingGuidance?: { openingOffer?: number; walkAway?: number; scriptHint?: string };
};

/**
 * Camera page — the live demo surface.
 *
 * v2: Added a "demo product picker" so judges don't need a real product on hand.
 *     Brutalist slabs, big verdict, haggling script → Order through ONDC.
 */
export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gtin, setGtin] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [city, setCity] = useState('Madurai');
  const [lang, setLang] = useState<'ta' | 'hi' | 'en'>('ta');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<FairPrice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }

        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128'] });
          const tick = async () => {
            if (cancelled || !videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) setGtin(codes[0].rawValue);
            } catch {}
            requestAnimationFrame(tick);
          };
          tick();
        } else {
          setManualMode(true);
        }
      } catch {
        setManualMode(true);
      }
    }
    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function lookup() {
    if (!gtin) return;
    setBusy(true);
    setError(null);
    setOrderResult(null);
    setOrderError(null);
    try {
      const r = await fetch('/api/fair-price', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gtin, city, lang }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setResult(await r.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function placeOrder() {
    if (!result) return;
    setOrdering(true);
    setOrderError(null);
    try {
      const r = await fetch('/api/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gtin, city, lang, acceptPrice: result.fairPriceBand.median }),
      });
      const data = await r.json();
      if (!r.ok) setOrderError(data.error || `HTTP ${r.status}`);
      else setOrderResult(data);
    } catch (e) {
      setOrderError(String(e));
    } finally {
      setOrdering(false);
    }
  }

  function pickDemo(p: { gtin: string; city: string }) {
    setGtin(p.gtin);
    setCity(p.city);
    setManualMode(true);
    setResult(null);
    setError(null);
    setOrderResult(null);
    setOrderError(null);
    // scroll to controls
    setTimeout(() => {
      const el = document.getElementById('controls');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return (
    <main className="min-h-screen bg-bone text-ink">
      <SiteNav />
      <header className="px-5 pt-6 pb-4 max-w-3xl mx-auto flex items-baseline justify-between border-b-2 border-ink">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Camera + Fair Price</h1>
          <div className="font-mono text-xs text-ghost mt-1">
            <span className="live-dot mr-1.5"></span>LIVE · Gemini 3.7 flash · 5 sources · Beckn
          </div>
        </div>
      </header>

      {/* CAMERA */}
      <section className="px-5 py-6 max-w-3xl mx-auto">
        <div className="relative w-full aspect-[3/4] bg-ink overflow-hidden border-2 border-ink shadow-brutal">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
          {/* brutalist crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-signal w-48 h-32 shadow-brutal-signal">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-signal" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-signal" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-signal" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-signal" />
            </div>
          </div>
          {gtin && (
            <div className="absolute bottom-0 left-0 right-0 bg-bone text-ink px-4 py-3 font-mono text-sm border-t-2 border-ink">
              GTIN: <span className="font-bold">{gtin}</span>
            </div>
          )}
          {manualMode && !gtin && (
            <div className="absolute inset-x-0 bottom-0 bg-bone/95 text-ink text-center py-3 text-sm font-mono">
              no camera? pick a demo product below
            </div>
          )}
        </div>
      </section>

      {/* DEMO PRODUCT PICKER */}
      <section className="px-5 py-6 max-w-3xl mx-auto border-t-2 border-ink">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ghost">
          ↓ pick a demo product (or scan a real one)
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {DEMO_PRODUCTS.map((p) => (
            <button
              key={p.gtin}
              onClick={() => pickDemo({ gtin: p.gtin, city: p.city })}
              className="slab text-left p-4"
            >
              <div className="text-3xl">{p.emoji}</div>
              <div className="mt-2 font-display text-base leading-tight">{p.name}</div>
              <div className="font-mono text-xs text-ghost mt-1">
                {p.brand} · {p.city}
              </div>
              <div className="mt-2 font-mono text-xs text-ok">
                fair ₹{p.expectedBand[0]}–{p.expectedBand[1]}
              </div>
              <div className="mt-2 text-xs leading-snug text-ink/70">{p.story}</div>
            </button>
          ))}
        </div>
      </section>

      {/* CONTROLS */}
      <section id="controls" className="px-5 py-6 max-w-3xl mx-auto border-t-2 border-ink space-y-3">
        <input
          value={gtin}
          onChange={(e) => setGtin(e.target.value)}
          placeholder="Enter GTIN (e.g. 8901058851649)"
          className="w-full px-4 py-3 border-2 border-ink font-mono text-base bg-paper"
          inputMode="numeric"
        />
        <div className="flex gap-2">
          <select value={city} onChange={(e) => setCity(e.target.value)} className="flex-1 px-3 py-2 border-2 border-ink font-mono text-sm bg-paper">
            {['Madurai', 'Bengaluru', 'Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Hyderabad'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={lang} onChange={(e) => setLang(e.target.value as 'ta' | 'hi' | 'en')} className="px-3 py-2 border-2 border-ink font-mono text-sm bg-paper">
            <option value="ta">தமிழ்</option>
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          onClick={lookup}
          disabled={!gtin || busy}
          className="w-full py-4 bg-ink text-bone font-display text-xl shadow-brutal disabled:opacity-40"
        >
          {busy ? 'Asking the oracle…' : 'Get fair price'}
        </button>
        {error && <div className="text-warn text-sm font-mono">⚠ {error}</div>}
      </section>

      {/* VERDICT */}
      {result && (
        <section className="px-5 py-8 max-w-3xl mx-auto border-t-2 border-ink">
          <div className="slab p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-ghost">Verdict</div>
                <div className="font-display text-2xl leading-tight mt-1">{result.product.name}</div>
              </div>
              <span className={`font-mono text-xs px-2 py-1 border-2 border-ink ${verdictStyle(result.verdict)}`}>
                {result.verdict.toUpperCase()}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <div className="font-display text-7xl leading-none tracking-tighter">₹{result.fairPriceBand.median}</div>
              <div className="font-mono text-xs text-ghost">
                band ₹{result.fairPriceBand.low ?? '—'} – ₹{result.fairPriceBand.high ?? '—'}<br />
                confidence {Math.round(result.confidence * 100)}%
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{result.reasoning}</p>
          </div>

          {/* HAGGLING SCRIPT */}
          {result.hagglingGuidance?.scriptHint && (
            <div className="mt-5 slab p-5">
              <div className="flex items-baseline justify-between">
                <div className="font-mono text-xs uppercase tracking-widest text-ghost">Haggling script ({lang})</div>
                {result.hagglingGuidance.openingOffer && result.hagglingGuidance.walkAway && (
                  <div className="font-mono text-xs">
                    offer ₹{result.hagglingGuidance.openingOffer} · walk above ₹{result.hagglingGuidance.walkAway}
                  </div>
                )}
              </div>
              <p className="mt-2 text-base leading-snug">{result.hagglingGuidance.scriptHint}</p>
              <Link href="/haggle" className="mt-3 inline-block text-sm font-mono underline">
                hear it in voice →
              </Link>
            </div>
          )}

          {/* ORDER */}
          <button
            onClick={placeOrder}
            disabled={ordering || result.verdict === 'insufficient_data'}
            className="mt-5 w-full py-4 bg-signal text-bone font-display text-xl shadow-brutal-signal disabled:opacity-40"
          >
            {ordering ? 'Placing Beckn order…' : 'Order through ONDC →'}
          </button>
          {orderResult && (
            <div className="mt-3 slab p-4 border-ok">
              <div className="font-mono text-xs uppercase tracking-widest text-ok">✓ Order placed</div>
              <div className="mt-1 font-mono text-sm">
                id <span className="font-bold">{orderResult.orderId}</span> · ₹{orderResult.price} · {orderResult.provider}
              </div>
              <div className="font-mono text-xs text-ghost mt-1">
                {Object.keys(orderResult.steps || {}).length} Beckn steps · ACK received
              </div>
            </div>
          )}
          {orderError && (
            <div className="mt-3 text-warn text-sm font-mono">⚠ {orderError}</div>
          )}

          {/* SOURCES */}
          <div className="mt-5">
            <div className="font-mono text-xs uppercase tracking-widest text-ghost">
              Sources ({result.sources.length})
            </div>
            <ul className="mt-2 space-y-1 text-xs font-mono">
              {result.sources.map((s, i) => (
                <li key={i} className="flex justify-between border-b border-ink/10 py-1">
                  <span>{s.name}</span>
                  <span className="font-bold">₹{s.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

function verdictStyle(v: FairPrice['verdict']): string {
  switch (v) {
    case 'fair': return 'bg-ok text-bone';
    case 'overpriced': return 'bg-warn text-bone';
    case 'underpriced': return 'bg-signal text-bone';
    default: return 'bg-ghost text-bone';
  }
}