'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logTransaction, recentTransactions, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

type Tx = {
  id?: string;
  merchantId: string;
  gtin: string;
  product: string;
  supplierPrice: number;
  fairPrice: number;
  saved: number;
  verdict: 'fair' | 'overpriced' | 'underpriced' | 'insufficient_data';
  timestamp?: unknown;
};

export default function LedgerPage() {
  const [merchantId] = useState('demo-merchant-1');
  const [rows, setRows] = useState<Tx[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setBusy(true);
    try {
      const r = await recentTransactions(merchantId, 20);
      setRows(r as Tx[]);
      setStatus(`Loaded ${r.length} transactions`);
    } catch (e) {
      setStatus(`Offline / Cache mode: ${String(e).slice(0, 80)}`);
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setBusy(true);
    setStatus('Seeding 3 verified transactions…');
    try {
      const samples: Omit<Tx, 'id' | 'timestamp'>[] = [
        { merchantId, gtin: '8901058851649', product: 'Amul Butter 500g', supplierPrice: 270, fairPrice: 252, saved: 18, verdict: 'overpriced' },
        { merchantId, gtin: '8901058851649', product: 'Amul Butter 500g', supplierPrice: 248, fairPrice: 252, saved: 0, verdict: 'fair' },
        { merchantId, gtin: '8901030865278', product: 'Parle-G 1kg', supplierPrice: 105, fairPrice: 96, saved: 9, verdict: 'overpriced' },
      ];
      for (const s of samples) {
        await addDoc(collection(db, 'transactions'), { ...s, timestamp: serverTimestamp() });
      }
      setSeeded(true);
      await refresh();
    } catch (e) {
      setStatus(`Seed notice: ${String(e).slice(0, 80)}`);
    } finally {
      setBusy(false);
    }
  }

  async function addOne() {
    setBusy(true);
    try {
      await logTransaction({
        merchantId,
        gtin: '8901058851649',
        product: 'Amul Butter 500g',
        supplierPrice: 260,
        fairPrice: 252,
        saved: 8,
        verdict: 'overpriced',
        sources: [
          { name: 'GS1 India (MRP)', price: 280, url: 'https://www.gs1india.org' },
          { name: 'ONDC Beckn — Madurai Wholesale', price: 252, url: 'https://ondc.org' },
        ],
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const totalSaved = rows.reduce((acc, r) => acc + (r.saved || 0), 0);
  const overPriceCount = rows.filter((r) => r.verdict === 'overpriced').length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-36">
      <SiteNav />

      {/* HEADER */}
      <div className="max-w-md sm:max-w-lg mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Margins Ledger</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Merchant: <span className="font-semibold text-slate-800">{merchantId}</span>
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
            Firestore Synced
          </span>
        </div>
      </div>

      {/* FINTECH SUMMARY CARDS */}
      <div className="max-w-md sm:max-w-lg mx-auto px-4 space-y-3 pt-3">
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-100">Cumulative Savings</span>
            <div className="text-4xl font-display font-extrabold mt-1">₹{totalSaved}</div>
            <div className="text-[11px] text-emerald-100 mt-0.5">Recovered margin across all audited purchases</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            💰
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="text-[10px] font-mono uppercase text-slate-400">Total Audited</div>
            <div className="text-2xl font-display font-bold text-slate-900 mt-1">{rows.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Verified receipts</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="text-[10px] font-mono uppercase text-rose-500 font-semibold">Overpriced Caught</div>
            <div className="text-2xl font-display font-bold text-rose-600 mt-1">{overPriceCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Suppliers flagged</div>
          </div>
        </div>

        {/* ACTION STRIP */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button
            onClick={seed}
            disabled={busy || seeded}
            className="px-3.5 py-2 rounded-xl bg-orange-600 text-white font-semibold text-xs shadow-sm hover:bg-orange-500 disabled:opacity-50 transition"
          >
            {seeded ? '✓ Demo Seeded' : '★ Seed 3 Transactions'}
          </button>
          <button
            onClick={addOne}
            disabled={busy}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
          >
            + Add Transaction
          </button>
          <button
            onClick={refresh}
            disabled={busy}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition"
          >
            ↻
          </button>
        </div>

        {status && <div className="text-[11px] font-mono text-slate-400">{status}</div>}

        {/* TRANSACTIONS LIST */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3 mt-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-100">
            <span>Verified Purchase Records</span>
            <span>Savings</span>
          </div>

          {rows.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs font-mono">
              No transactions yet &bull; Tap &ldquo;Seed 3 Transactions&rdquo; above
            </div>
          )}

          <div className="space-y-2">
            {rows.map((r, i) => (
              <div
                key={r.id || i}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-900">{r.product}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Supplier: ₹{r.supplierPrice} &bull; Fair: ₹{r.fairPrice}
                  </div>
                </div>

                <div className="text-right">
                  {r.saved > 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                      +₹{r.saved}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-mono">—</span>
                  )}
                  <div className="mt-0.5">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        r.verdict === 'fair' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {r.verdict}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
