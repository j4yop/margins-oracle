'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { synthesizeSpeech } from '@/lib/tts';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

type Line = { role: 'supplier' | 'shopkeeper' | 'oracle'; text: string; lang: 'ta' | 'hi' | 'en' };
type Script = { median?: number; lang?: string; lines: Line[]; cached?: boolean; generated_by?: string };

const FALLBACK_SCRIPT: Line[] = [
  { role: 'supplier', text: 'Anna, today 500 gram Amul butter ₹285. Last week ₹280. Inflation.', lang: 'en' },
  { role: 'shopkeeper', text: 'Ayyo, ₹285? Market-ல ₹252-ku கிடைக்குது. ₹270 final-aa?', lang: 'ta' },
  { role: 'supplier', text: '₹270 not possible, brother. Driver costs, fuel, GST. ₹280 last price.', lang: 'en' },
  { role: 'oracle', text: 'Say: "₹260 final-aa illa na, next supplier-ku call pannuren." Walk away above ₹268.', lang: 'en' },
  { role: 'shopkeeper', text: '₹260 final, otherwise next week-க்கு வேற supplier பார்க்கிறேன்.', lang: 'ta' },
  { role: 'supplier', text: 'Okay okay, ₹265. Only for you, Anna. Last price.', lang: 'en' },
  { role: 'oracle', text: 'Settle at ₹263. Say: "₹263 final, deal-aa." Saved ₹22 vs MRP.', lang: 'en' },
];

const DEFAULT_PRODUCT = { gtin: '8901058851649', city: 'Madurai', lang: 'ta' as const };

export default function HagglePage() {
  const [paymentTerms, setPaymentTerms] = useState<'cash' | '15_days' | '30_days'>('15_days');
  const [script, setScript] = useState<Script | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settled, setSettled] = useState<{ saved: number; final: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadScript(paymentTerms);
  }, [paymentTerms]);

  async function loadScript(terms: 'cash' | '15_days' | '30_days' = paymentTerms) {
    setLoading(true);
    setError(null);
    setLines([]);
    setStep(-1);
    setSettled(null);
    try {
      const r = await fetch('/api/haggle/script', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...DEFAULT_PRODUCT, paymentTerms: terms }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as Script;
      setScript(data);
    } catch (e) {
      setError(String(e));
      setScript({ lines: FALLBACK_SCRIPT, generated_by: 'fallback' });
    } finally {
      setLoading(false);
    }
  }

  async function playTurn(i: number) {
    if (!script || i >= script.lines.length) {
      if (script?.median) {
        const final = Math.round(script.median * (paymentTerms === 'cash' ? 0.94 : 0.97));
        setSettled({ final, saved: 280 - final });
      }
      return;
    }
    setBusy(true);
    setStep(i);
    const t = script.lines[i];
    setLines((prev) => [...prev, t]);

    if (t.role === 'supplier' || t.role === 'oracle') {
      try {
        setPlaying(true);
        const voice = t.role === 'supplier' ? 'Orus' : 'Kore';
        const lang = t.lang === 'ta' ? 'ta-IN' : t.lang === 'hi' ? 'hi-IN' : 'en-IN';
        const b64 = await synthesizeSpeech({ text: t.text, voice, lang });
        const url = wavFromPcm(b64, 24000);
        if (audioRef.current) audioRef.current.pause();
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = () => {
          setPlaying(false);
          URL.revokeObjectURL(url);
          setTimeout(() => playTurn(i + 1), 700);
        };
        await a.play();
      } catch (e) {
        setPlaying(false);
        console.warn('[tts]', String(e));
        setTimeout(() => playTurn(i + 1), 500);
      }
    } else {
      setTimeout(() => playTurn(i + 1), 1600);
    }
    setBusy(false);
  }

  function start() {
    setLines([]);
    setStep(-1);
    setSettled(null);
    playTurn(0);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-36">
      <SiteNav />

      {/* HEADER */}
      <div className="max-w-md sm:max-w-lg mx-auto w-full px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Voice Haggling Co-Pilot</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? 'Consulting Gemini…' : '7-line live bazaar negotiation in dialect'}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-mono font-bold uppercase">
            Gemini TTS
          </span>
        </div>

        {/* PAYMENT TERMS TOGGLE */}
        <div className="mt-3 p-1 rounded-xl bg-slate-200/80 grid grid-cols-3 gap-1 text-[11px] font-semibold">
          {[
            { id: 'cash', label: '💵 Spot Cash' },
            { id: '15_days', label: '⏳ 15d Udhaar' },
            { id: '30_days', label: '📦 30d Credit' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPaymentTerms(t.id as any)}
              disabled={loading || busy}
              className={`py-1.5 px-2 rounded-lg text-center transition ${
                paymentTerms === t.id
                  ? 'bg-white text-orange-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto w-full px-4 mt-2">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-mono border border-rose-200">
            ⚠ {error} — using fallback negotiation script
          </div>
        </div>
      )}

      {/* CONVERSATION AREA */}
      <div className="flex-1 max-w-md sm:max-w-lg mx-auto w-full px-4 py-4 space-y-3">
        {lines.length === 0 && !loading && (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center shadow-sm space-y-2 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 text-2xl flex items-center justify-center mx-auto">
              🎙️
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              Amul Butter 500g &bull; Madurai
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Distributor quotes ₹285. MARGINS whispers back the fair counter-offer in Tamil. Tap below to start.
            </p>
          </div>
        )}

        {lines.map((t, i) => (
          <div
            key={i}
            className={`pop-in p-4 rounded-2xl shadow-sm space-y-1 ${
              t.role === 'oracle'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white mx-1 my-2 shadow-md shadow-orange-500/20'
                : t.role === 'supplier'
                ? 'bg-white border border-slate-200 text-slate-900 mr-8 rounded-tl-sm'
                : 'bg-slate-900 text-white ml-8 rounded-tr-sm'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono tracking-wider opacity-75">
              <span>
                {t.role === 'oracle'
                  ? '⚡ MARGINS WHISPER'
                  : t.role === 'supplier'
                  ? '🚚 DISTRIBUTOR TRUCK'
                  : '🏪 YOU (KIRANA OWNER)'}
              </span>
              {t.role === 'oracle' && playing && (
                <span className="flex items-center gap-1 font-bold text-amber-200">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Speaking…
                </span>
              )}
            </div>
            <div className="text-sm font-medium leading-snug">{t.text}</div>
          </div>
        ))}
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30">
        <div className="max-w-md mx-auto">
          {settled ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase">
                  ✓ Deal Closed at ₹{settled.final}
                </span>
                <div className="text-xs text-emerald-700 mt-0.5">
                  Saved ₹{settled.saved} vs sticker MRP on {paymentTerms} terms!
                </div>
              </div>
              <Link
                href="/ledger"
                className="block w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-center text-xs shadow-md hover:bg-slate-800 transition"
              >
                View in Margins Ledger &rarr;
              </Link>
            </div>
          ) : (
            <button
              onClick={start}
              disabled={loading || busy}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                'Consulting Gemini…'
              ) : busy ? (
                playing ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Audio Playing…</span>
                  </>
                ) : (
                  'Next Speaker…'
                )
              ) : step >= 0 ? (
                '↻ Replay Negotiation'
              ) : (
                '▶ Start Haggling Scene'
              )}
            </button>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function wavFromPcm(pcmB64: string, rate: number): string {
  const pcm = atob(pcmB64);
  const pcmBytes = new Uint8Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) pcmBytes[i] = pcm.charCodeAt(i);
  const dataLen = pcmBytes.length;
  const wav = new Uint8Array(44 + dataLen);
  const view = new DataView(wav.buffer);
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + dataLen, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, dataLen, true);
  wav.set(pcmBytes, 44);
  return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
}