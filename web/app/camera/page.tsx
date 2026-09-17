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

type InvoiceAudit = {
  distributor?: { name?: string; invoiceNo?: string; date?: string; city?: string };
  items: {
    name: string;
    sku?: string;
    qty?: number;
    unit?: string;
    rate: number;
    total?: number;
    mrp?: number;
    benchmarkFairRate: number;
    discrepancy: number;
    verdict: 'fair' | 'overpriced' | 'underpriced';
    note?: string;
  }[];
  summary: {
    totalBilled: number;
    totalFair: number;
    totalOvercharged: number;
    flaggedItemsCount: number;
  };
  actionableAdvice: string;
  analyzed_by?: string;
};

export default function CameraPage() {
  const [activeTab, setActiveTab] = useState<'barcode' | 'invoice'>('barcode');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Invoice audit state
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceAudit | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (activeTab !== 'barcode') {
        stream?.getTracks().forEach((t) => t.stop());
        setStream(null);
        return;
      }

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
  }, [activeTab]);

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
    setTimeout(() => {
      const el = document.getElementById('controls');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function handleInvoiceFile(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result as string;
      setInvoicePreview(b64);
      runInvoiceAudit({ imageBase64: b64, mimeType: file.type || 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  }

  async function runInvoiceAudit(payload: { imageBase64?: string; mimeType?: string; useSample?: boolean }) {
    setInvoiceBusy(true);
    setInvoiceError(null);
    try {
      const r = await fetch('/api/audit/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, city }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setInvoiceResult(data);
    } catch (e) {
      setInvoiceError(String(e));
    } finally {
      setInvoiceBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <SiteNav />

      {/* MOBILE APP HEADER & SEGMENTED TABS */}
      <div className="max-w-md sm:max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="p-1 rounded-2xl bg-slate-200/80 grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('barcode')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'barcode'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📸 Barcode Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'invoice'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📄 Parchi Auditor</span>
          </button>
        </div>
      </div>

      {/* MODE 1: BARCODE SCANNER */}
      {activeTab === 'barcode' && (
        <div className="max-w-md sm:max-w-lg mx-auto px-4 space-y-4 pt-2">
          {/* CAMERA VIEWFINDER */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-3xl overflow-hidden shadow-md border border-slate-800">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
            
            {/* Animated Laser Scanline */}
            <div className="scan-laser" />

            {/* Target Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-36 border-2 border-orange-500/60 rounded-2xl relative shadow-lg shadow-orange-500/10">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-orange-500 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-orange-500 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-orange-500 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-orange-500 rounded-br-lg" />
              </div>
            </div>

            {/* Scanned GTIN Pill */}
            {gtin && (
              <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur px-3 py-2 rounded-xl text-xs font-mono font-semibold flex items-center justify-between shadow-sm">
                <span className="text-slate-500">GTIN Detected:</span>
                <span className="text-orange-600 font-bold">{gtin}</span>
              </div>
            )}

            {manualMode && !gtin && (
              <div className="absolute inset-x-3 bottom-3 bg-slate-900/80 backdrop-blur text-white text-center py-2 px-3 rounded-xl text-xs font-medium">
                Camera inactive? Pick a sample product below
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div id="controls" className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Barcode Number (GTIN)
              </label>
              <input
                value={gtin}
                onChange={(e) => setGtin(e.target.value)}
                placeholder="Enter barcode (e.g. 8901058851649)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Mandi City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500"
                >
                  {['Madurai', 'Bengaluru', 'Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Hyderabad'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <button
              onClick={lookup}
              disabled={!gtin || busy}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <span className="live-dot" />
                  <span>Consulting 5 Sources & Gemini…</span>
                </>
              ) : (
                'Compute Fair Price Band'
              )}
            </button>
            {error && <div className="text-rose-600 text-xs font-medium">⚠ {error}</div>}
          </div>

          {/* VERDICT CARD */}
          {result && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Product Verdict</span>
                  <h2 className="font-display font-bold text-xl text-slate-900 mt-0.5">{result.product.name}</h2>
                  <div className="text-xs text-slate-500 mt-0.5">MRP: ₹{result.product.mrp ?? '—'} &bull; {city} Mandi</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    result.verdict === 'fair'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {result.verdict}
                </span>
              </div>

              {/* Price Band Display */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Fair Wholesale Price</div>
                  <div className="text-4xl font-display font-extrabold text-orange-600">
                    ₹{result.fairPriceBand.median}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-0.5">
                  <div>Band: <strong className="text-slate-800">₹{result.fairPriceBand.low ?? '—'} – ₹{result.fairPriceBand.high ?? '—'}</strong></div>
                  <div>Confidence: <strong className="text-emerald-600">{Math.round(result.confidence * 100)}%</strong></div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-orange-50/50 p-3 rounded-xl border border-orange-100/60">
                {result.reasoning}
              </p>

              {/* Haggling Script Snippet */}
              {result.hagglingGuidance?.scriptHint && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Negotiation Hint ({lang}):</span>
                    <span>Offer ₹{result.hagglingGuidance.openingOffer} &bull; Walk ₹{result.hagglingGuidance.walkAway}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 italic">
                    &ldquo;{result.hagglingGuidance.scriptHint}&rdquo;
                  </p>
                  <Link href="/haggle" className="inline-block text-[11px] text-orange-600 font-semibold hover:underline mt-1">
                    Play full negotiation in voice &rarr;
                  </Link>
                </div>
              )}

              {/* Order via ONDC Button */}
              <button
                onClick={placeOrder}
                disabled={ordering}
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-md hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {ordering ? 'Transacting on ONDC Beckn…' : '📦 Order via ONDC at Fair Price'}
              </button>

              {orderResult && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-800">✓ Order Placed on Beckn Network</div>
                  <div className="text-emerald-700 font-mono">ID: {orderResult.orderId} &bull; ₹{orderResult.price}</div>
                </div>
              )}
              {orderError && <div className="text-xs text-rose-600 font-mono">⚠ {orderError}</div>}
            </div>
          )}

          {/* DEMO PRODUCT QUICK PICKER */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Sample Products &bull; One-Tap Test
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PRODUCTS.map((p) => (
                <button
                  key={p.gtin}
                  onClick={() => pickDemo({ gtin: p.gtin, city: p.city })}
                  className="p-3 rounded-2xl bg-white border border-slate-200/80 text-left hover:border-orange-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      ₹{p.expectedBand[0]}–{p.expectedBand[1]}
                    </span>
                  </div>
                  <div className="mt-2 font-display font-semibold text-xs text-slate-900 group-hover:text-orange-600 transition leading-tight">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.city}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DELIVERY INVOICE (PARCHI) AUDITOR */}
      {activeTab === 'invoice' && (
        <div className="max-w-md sm:max-w-lg mx-auto px-4 space-y-4 pt-2">
          {/* UPLOAD / INTRO CARD */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">
                Audit Paper Delivery Memo (*Parchi*)
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Take a photo of the distributor truck&apos;s printed receipt. Gemini vision audits all line-items
                against mandi clearing rates and MRP in under 5 seconds.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleInvoiceFile(e.target.files[0]);
              }}
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={invoiceBusy}
                className="py-3 px-4 rounded-xl bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 hover:bg-orange-500 transition flex items-center justify-center gap-1.5"
              >
                <span>📸 Photo / Upload</span>
              </button>
              <button
                onClick={() => runInvoiceAudit({ useSample: true })}
                disabled={invoiceBusy}
                className="py-3 px-4 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition"
              >
                <span>★ Try Sample Bill</span>
              </button>
            </div>
          </div>

          {invoiceBusy && (
            <div className="p-6 rounded-2xl bg-white border border-orange-200 text-center shadow-sm space-y-2">
              <span className="live-dot" />
              <div className="text-xs font-semibold text-slate-800">
                Gemini Vision Auditing Invoice Items…
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Matching against GS1 India MRP & Mandi Clearing Rates
              </div>
            </div>
          )}

          {invoiceError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
              ⚠ {invoiceError}
            </div>
          )}

          {invoiceResult && (
            <div className="space-y-4">
              {/* SUMMARY STATS GRID */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Billed Total</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">₹{invoiceResult.summary.totalBilled}</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Fair Value</div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">₹{invoiceResult.summary.totalFair}</div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-[10px] font-mono text-rose-600 font-bold uppercase">Overcharge</div>
                  <div className="text-lg font-bold text-rose-600 mt-0.5">
                    +₹{invoiceResult.summary.totalOvercharged}
                  </div>
                </div>
              </div>

              {/* ACTIONABLE ADVICE */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 space-y-1">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <span>🚨 Urgent Advice for Shopkeeper</span>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {invoiceResult.actionableAdvice}
                </p>
              </div>

              {/* LINE ITEMS LIST */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-100">
                  <span>Line Items Audited ({invoiceResult.items.length})</span>
                  <span>{invoiceResult.distributor?.invoiceNo}</span>
                </div>

                <div className="space-y-2.5">
                  {invoiceResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            item.verdict === 'overpriced'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.verdict}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono">
                          {item.qty} {item.unit} &bull; Rate: <strong>₹{item.rate}</strong>
                        </span>
                        <span className="font-mono text-xs">
                          Fair: <strong className="text-emerald-700">₹{item.benchmarkFairRate}</strong>{' '}
                          <span className="text-slate-400 line-through">(MRP ₹{item.mrp})</span>
                        </span>
                      </div>
                      {item.note && (
                        <div className="text-[11px] text-slate-500 italic">
                          {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/haggle"
                    className="block w-full py-3 rounded-xl bg-slate-900 text-white text-center font-semibold text-xs shadow-md hover:bg-slate-800 transition"
                  >
                    Dispute Billed Rates in Voice Haggle &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <SiteFooter />
    </main>
  );
}