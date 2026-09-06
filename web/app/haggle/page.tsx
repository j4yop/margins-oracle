'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { synthesizeSpeech } from '@/lib/tts';

type Line = { role: 'supplier' | 'shopkeeper' | 'oracle'; text: string; lang: 'ta' | 'hi' | 'en' };
type Script = { median?: number; lang?: string; lines: Line[]; cached?: boolean; generated_by?: string };

/**
 * Haggling scene — Phase 3 of MARGINS.
 *
 * v2: The script is generated server-side by Gemini based on the actual product
 *     fair-price band, then played back with Gemini TTS. Each line is synthesised
 *     lazily so we don't burn TTS quota on lines the user might not reach.
 *     Falls back to a static demo script if the API is unavailable.
 */
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
    loadScript();
  }, []);

  async function loadScript() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/haggle/script', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(DEFAULT_PRODUCT),
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
      // compute savings vs MRP
      if (script?.median) {
        const final = Math.round(script.median * 0.97);
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
          setTimeout(() => playTurn(i + 1), 800);
        };
        await a.play();
      } catch (e) {
        setPlaying(false);
        console.warn('[tts]', String(e));
        setTimeout(() => playTurn(i + 1), 600);
      }
    } else {
      // shopkeeper line — short pause as if speaking
      setTimeout(() => playTurn(i + 1), 1800);
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
    <main className="min-h-screen bg-bone text-ink flex flex-col">
      <header className="px-5 pt-6 pb-4 border-b-2 border-ink flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-3xl">Haggling</h1>
          <div className="font-mono text-xs text-ghost mt-1">
            {loading ? 'Generating script with Gemini…' : script?.cached ? 'cached · Gemini-generated' : `fresh · ${script?.generated_by ?? 'gemini'}`}
          </div>
        </div>
        <Link href="/" className="font-mono text-xs underline">← home</Link>
      </header>

      {error && (
        <div className="mx-5 mt-3 p-3 border-2 border-warn text-warn text-xs font-mono">
          ⚠ {error} — using fallback script
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-3 pb-32">
        {lines.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="font-display text-2xl">A 7-line haggling scene</div>
            <div className="mt-2 font-mono text-xs text-ghost max-w-md mx-auto">
              The supplier quotes an unfair price. MARGINS whispers back. The shopkeeper pushes back. Settle, or walk.
            </div>
          </div>
        )}
        {lines.map((t, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-4 border-2 border-ink ${
              t.role === 'oracle'
                ? 'ml-auto bg-ink text-bone'
                : t.role === 'supplier'
                ? 'bg-paper'
                : 'mr-auto bg-signal/10'
            }`}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
              {t.role === 'oracle' ? 'MARGINS · oracle' : t.role === 'supplier' ? 'Supplier (TN Distributors)' : 'You · Madurai kirana'}
            </div>
            <div className="text-base leading-snug">{t.text}</div>
            {t.role === 'oracle' && playing && (
              <div className="mt-1 flex items-center gap-1 font-mono text-[10px] opacity-60">
                <span className="live-dot"></span> speaking
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-bone border-t-2 border-ink">
        {settled ? (
          <div>
            <div className="font-display text-center text-2xl mb-2">
              ✓ settled at <span className="text-signal">₹{settled.final}</span> · saved ₹{settled.saved}
            </div>
            <Link href="/ledger" className="block w-full py-3 bg-ink text-bone font-display text-center text-lg">
              See in ledger →
            </Link>
          </div>
        ) : (
          <button
            onClick={start}
            disabled={loading || busy}
            className="w-full py-4 bg-ink text-bone font-display text-xl disabled:opacity-40"
          >
            {loading ? '…' : busy ? (playing ? '🔊 playing…' : '…') : step >= 0 ? 'Replay' : 'Start haggling'}
          </button>
        )}
      </div>
    </main>
  );
}

/** Wrap raw L16 PCM (24kHz mono) into a minimal WAV file as a base64 blob URL. */
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