'use client';

import { useEffect, useState } from 'react';
import { CameraIcon, ScanIcon, SparkleIcon } from './Icons';

const STEPS = [
  { id: 'SCAN', label: 'READING BOX', dur: 900 },
  { id: 'GTIN', label: 'GTIN 8901058851649', dur: 700 },
  { id: 'GS1', label: 'GS1 INDIA · MRP ₹280', dur: 800 },
  { id: 'BECKN', label: 'BECKN · 3 QUOTES', dur: 900 },
  { id: 'GEMINI', label: 'GEMINI · MEDIAN ₹252', dur: 700 },
  { id: 'OK', label: '✓ VERDICT · FAIR', dur: 1200 },
];

/**
 * PhoneScreen — the live, looping "scan a product" demo that lives inside the iPhone mockup.
 * No backend, no API calls — just an animated stage that proves "this is the product surface".
 */
export default function PhoneScreen() {
  const [step, setStep] = useState(0);
  const [gtin, setGtin] = useState('8901058851649');

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    function tick() {
      setStep((s) => (s + 1) % STEPS.length);
      t = setTimeout(tick, STEPS[step].dur);
    }
    t = setTimeout(tick, STEPS[step].dur);
    return () => clearTimeout(t);
  }, [step]);

  const current = STEPS[step];

  return (
    <div className="h-full w-full flex flex-col bg-bone">
      {/* camera viewfinder */}
      <div className="relative h-[42%] m-3 border-2 border-ink overflow-hidden bg-ink">
        {/* brutalist product silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-3/5 w-3/5 rotate-3 border-2 border-bone/40">
            <div className="absolute top-2 left-2 right-2 h-1.5 bg-bone/40" />
            <div className="absolute top-5 left-2 right-1/2 h-1 bg-bone/30" />
            <div className="absolute top-7 left-2 right-1/3 h-1 bg-bone/30" />
            <div className="absolute bottom-2 left-2 h-3 w-3 border-2 border-bone/60" />
            <div className="absolute bottom-2 right-2 font-mono text-[8px] text-bone/70">
              AMUL
            </div>
          </div>
        </div>
        {/* crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-20 w-32 border-2 border-signal">
            <span className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-signal" />
            <span className="absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-signal" />
            <span className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-signal" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-signal" />
          </div>
        </div>
        {/* scanning line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-signal animate-scan" />
        {/* corner badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-bone text-ink px-1.5 py-0.5 text-[8px] font-mono">
          <CameraIcon size={8} /> LIVE
        </div>
      </div>

      {/* status strip */}
      <div className="mx-3 mb-2 flex items-center justify-between border-2 border-ink bg-ink px-2 py-1.5 font-mono text-[9px] text-bone">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
          {current.label}
        </span>
        <span>{step + 1}/{STEPS.length}</span>
      </div>

      {/* product card */}
      <div className="mx-3 mb-2 border-2 border-ink bg-paper p-2.5">
        <div className="font-mono text-[8px] text-ghost uppercase tracking-widest">Verdict</div>
        <div className="mt-0.5 font-display text-sm leading-tight">Amul Butter 500g</div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none">₹252</span>
          <span className="font-mono text-[9px] text-ghost">band 247–262</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[9px]">
          <span className="bg-ok text-bone px-1 py-0.5">FAIR</span>
          <span className="text-ghost">vs MRP ₹280</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-3 mt-auto mb-3">
        <div className="w-full border-2 border-ink bg-signal py-2 text-center font-display text-bone text-xs">
          Order through ONDC →
        </div>
      </div>
    </div>
  );
}
