'use client';

import { useEffect, useState } from 'react';
import { CameraIcon, ScanIcon, SparkleIcon, HandshakeIcon, BoxIcon } from './Icons';

const STEPS = [
  { id: 'SCAN', mode: 'barcode', label: 'TARGETING GTIN BARCODE', dur: 1200 },
  { id: 'GTIN', mode: 'barcode', label: 'GTIN 8901058851649 READ', dur: 900 },
  { id: 'GS1', mode: 'barcode', label: 'GS1 INDIA · MRP ₹280', dur: 900 },
  { id: 'BECKN', mode: 'barcode', label: 'ONDC BECKN · 3 BPP QUOTES', dur: 1000 },
  { id: 'GEMINI', mode: 'barcode', label: 'GEMINI 2.5 · FAIR ₹252', dur: 900 },
  { id: 'VERDICT', mode: 'barcode', label: '✓ VERDICT: FAIR · SAVE ₹28', dur: 1800 },
  { id: 'PARCHI', mode: 'parchi', label: 'INVOICE (PARCHI) AUDITOR', dur: 1400 },
  { id: 'PARCHI_OCR', mode: 'parchi', label: 'GEMINI VISION OCR DISCREPANCY', dur: 1600 },
];

export default function PhoneScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, STEPS[step].dur);
    return () => clearTimeout(t);
  }, [step]);

  const current = STEPS[step];
  const isParchi = current.mode === 'parchi';

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 text-slate-900 select-none">
      {/* Mode Switcher Tabs */}
      <div className="px-3 pt-1 pb-2 flex items-center gap-1.5 border-b border-slate-200/80 bg-white">
        <div
          className={`flex-1 py-1 rounded-lg text-[10px] font-mono text-center font-bold transition-all ${
            !isParchi
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Barcode Scan
        </div>
        <div
          className={`flex-1 py-1 rounded-lg text-[10px] font-mono text-center font-bold transition-all ${
            isParchi
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Parchi (Invoice)
        </div>
      </div>

      {/* Camera / Viewfinder Box */}
      <div className="relative mx-3 mt-2 h-[40%] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex flex-col justify-between p-2.5">
        {/* Top Viewfinder Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 text-emerald-400 text-[8px] font-mono font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isParchi ? 'MULTIMODAL OCR' : 'BARCODE ACTIVE'}
          </div>
          <div className="text-[8px] font-mono text-slate-400">
            {step + 1}/{STEPS.length}
          </div>
        </div>

        {/* Viewfinder Center Graphics */}
        {!isParchi ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Target Reticle */}
            <div className="relative h-24 w-36 rounded-xl border border-orange-500/40 bg-orange-500/5 flex items-center justify-center">
              {/* Corner brackets */}
              <span className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-orange-500 rounded-tl" />
              <span className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-orange-500 rounded-tr" />
              <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-orange-500 rounded-bl" />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-orange-500 rounded-br" />

              {/* Barcode Mock Silhouette */}
              <div className="flex items-center gap-1 opacity-70">
                <span className="w-1 h-10 bg-white" />
                <span className="w-2 h-10 bg-white" />
                <span className="w-0.5 h-10 bg-white" />
                <span className="w-1.5 h-10 bg-white" />
                <span className="w-0.5 h-10 bg-white" />
                <span className="w-2 h-10 bg-white" />
                <span className="w-1 h-10 bg-white" />
              </div>

              {/* Animated Laser Scan Line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_8px_#f97316] animate-scan" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Paper Parchi Silhouette */}
            <div className="relative h-28 w-36 rounded-lg border border-amber-400/40 bg-white/95 p-2 shadow-lg text-[7px] font-mono text-slate-800">
              <div className="font-bold border-b border-slate-200 pb-0.5 flex justify-between">
                <span>PARCHI INVOICE</span>
                <span className="text-amber-600">#4092</span>
              </div>
              <div className="mt-1 flex justify-between text-slate-600">
                <span>Amul Butter 500g</span>
                <span className="font-bold text-red-600">₹275 billed</span>
              </div>
              <div className="mt-0.5 flex justify-between text-slate-400 text-[6px]">
                <span>Distributor rate</span>
                <span className="text-emerald-600">fair: ₹252</span>
              </div>
              <div className="mt-1.5 bg-red-50 text-red-700 px-1 py-0.5 rounded text-[6px] font-semibold">
                ⚠ Overbilled ₹23/unit
              </div>
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-scan" />
            </div>
          </div>
        )}

        {/* Viewfinder Bottom Status Pill */}
        <div className="z-10 bg-slate-950/80 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1.5 border border-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-mono text-[8px] text-white tracking-wide truncate">
            {current.label}
          </span>
        </div>
      </div>

      {/* Dynamic Product / Audit Card */}
      <div className="mx-3 mt-2 flex-1 flex flex-col justify-between">
        {!isParchi ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  GS1 · 8901058851649
                </span>
                <h4 className="font-sans font-bold text-xs text-slate-900 leading-tight">
                  Amul Salted Butter 500g
                </h4>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                FAIR PRICE
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between pt-1.5 border-t border-slate-100">
              <div>
                <div className="text-[8px] font-mono text-slate-400 uppercase">Fair Wholesale</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-sans text-xl font-extrabold text-orange-600">₹252</span>
                  <span className="text-[9px] font-mono text-slate-400">band ₹248–₹254</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-mono text-slate-400 uppercase">MRP</div>
                <div className="text-[11px] font-mono line-through text-slate-400">₹280</div>
              </div>
            </div>

            <div className="mt-2 py-1 px-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[8px] font-mono">
              <span className="text-slate-600 flex items-center gap-1">
                <HandshakeIcon size={9} /> 3 Beckn BPP Quotes
              </span>
              <span className="text-emerald-600 font-bold">Save ₹28 / unit</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-2.5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  Parchi OCR Discrepancy
                </span>
                <h4 className="font-sans font-bold text-xs text-slate-900 leading-tight">
                  Overcharging Detected
                </h4>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                AUDIT ALERT
              </span>
            </div>

            <div className="mt-1.5 text-[9px] text-slate-700 leading-tight">
              Distributor charged <strong className="text-red-600 font-mono">₹275</strong> vs verified mandi band <strong className="text-emerald-700 font-mono">₹252</strong>.
            </div>

            <div className="mt-2 py-1 px-2 rounded-lg bg-white border border-amber-200 flex items-center justify-between text-[8px] font-mono">
              <span className="text-amber-800 font-medium">Excess on 20 units:</span>
              <span className="text-red-600 font-bold">+₹460 overpaid</span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-2 mb-3">
          <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-sans text-xs font-bold text-center shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5">
            <span>{isParchi ? 'Claim Overcharge Credit →' : 'Order via Beckn ONDC →'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
