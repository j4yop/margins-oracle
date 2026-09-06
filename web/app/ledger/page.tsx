'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logTransaction, recentTransactions, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
      setStatus(`loaded ${r.length} transactions`);
    } catch (e) {
      setStatus(`offline: ${String(e).slice(0, 100)}`);
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setBusy(true);
    setStatus('seeding 3 demo transactions…');
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
      setStatus(`seed error: ${String(e).slice(0, 100)}`);
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
    <main className="min-h-screen bg-bone text-ink">
      <header className="px-5 py-6 border-b-2 border-ink flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-3xl">Margins Ledger</h1>
          <p className="mt-1 font-mono text-xs text-ghost">
            merchant <span className="text-ink">{merchantId}</span> · every verified fair-price transaction
          </p>
        </div>
        <Link href="/" className="font-mono text-xs underline">← home</Link>
      </header>

      <section className="px-5 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="slab p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ghost">Total saved</div>
            <div className="font-display text-3xl mt-1 text-signal">₹{totalSaved}</div>
          </div>
          <div className="slab p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ghost">Transactions</div>
            <div className="font-display text-3xl mt-1">{rows.length}</div>
          </div>
          <div className="slab p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ghost">Overpriced caught</div>
            <div className="font-display text-3xl mt-1">{overPriceCount}</div>
          </div>
        </div>
      </section>

      <section className="px-5 py-4 max-w-4xl mx-auto flex gap-2 flex-wrap">
        <button
          onClick={seed}
          disabled={busy || seeded}
          className="px-4 py-2 bg-ink text-bone font-mono text-sm border-2 border-ink disabled:opacity-40"
        >
          {seeded ? '✓ seeded' : 'seed 3 demo txns'}
        </button>
        <button
          onClick={addOne}
          disabled={busy}
          className="px-4 py-2 border-2 border-ink font-mono text-sm"
        >
          + add one
        </button>
        <button
          onClick={refresh}
          disabled={busy}
          className="px-4 py-2 border-2 border-ink font-mono text-sm"
        >
          ↻ refresh
        </button>
        {status && <div className="self-center font-mono text-xs text-ghost">{status}</div>}
      </section>

      <section className="px-5 py-6 max-w-4xl mx-auto border-t-2 border-ink">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-mono uppercase tracking-widest text-ghost border-b-2 border-ink">
            <tr>
              <th className="py-2">product</th>
              <th className="py-2 text-right">supplier</th>
              <th className="py-2 text-right">fair</th>
              <th className="py-2 text-right">saved</th>
              <th className="py-2">verdict</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-ghost font-mono text-xs">no transactions yet — click "seed"</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-ink/10">
                <td className="py-2 pr-2">{r.product}</td>
                <td className="py-2 text-right font-mono">₹{r.supplierPrice}</td>
                <td className="py-2 text-right font-mono">₹{r.fairPrice}</td>
                <td className={`py-2 text-right font-mono ${r.saved > 0 ? 'text-ok font-bold' : 'text-ghost'}`}>
                  {r.saved > 0 ? `+₹${r.saved}` : '—'}
                </td>
                <td className="py-2">
                  <span className={`text-xs font-mono px-1.5 py-0.5 border border-ink ${r.verdict === 'fair' ? 'bg-ok text-bone' : r.verdict === 'overpriced' ? 'bg-warn text-bone' : 'bg-ghost text-bone'}`}>
                    {r.verdict}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="px-5 py-8 max-w-4xl mx-auto border-t-2 border-ink font-mono text-xs text-ghost">
        Voice-queryable via Gemini Live API · stored in Firestore · <Link href="/" className="underline">home</Link>
      </footer>
    </main>
  );
}