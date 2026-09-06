/**
 * /api/haggle/script
 *
 * Returns a generated haggling script based on the product's fair-price band.
 * Pre-generates 4 supplier quotes (overpriced), 3 oracle whispers, 2 shopkeeper
 * responses, and 1 settlement line. Each line tagged with the role + language.
 *
 * Generated server-side with Gemini so it's "real" content, not static.
 * Caches per product+city so repeated calls are fast.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proModel, flashModel, MODELS } from '@/lib/gemini';
import { lookupGTIN } from '@/lib/gs1';
import { becknSearch } from '@/lib/beckn';
import { agmarknetPrice } from '@/lib/agmarknet';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  gtin: z.string().min(8),
  city: z.string().default('Madurai'),
  lang: z.enum(['ta', 'hi', 'en']).default('ta'),
  median: z.number().optional(),
  quantity: z.number().default(1),
});

const cache = new Map<string, { ts: number; payload: any }>();
const TTL = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = InputSchema.parse(await req.json());
    const key = `${body.gtin}-${body.city}-${body.lang}-${body.median ?? 'auto'}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < TTL) {
      return NextResponse.json({ ...hit.payload, cached: true });
    }

    // If no median passed, compute one
    let median = body.median;
    if (!median) {
      const product = await lookupGTIN(body.gtin);
      const beckn = await becknSearch({ gtin: body.gtin, city: body.city });
      const prices = [product.mrp, ...beckn.quotes.map((q) => q.price)].filter(Boolean) as number[];
      median = prices.length ? Math.round(prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]) : 100;
    }

    const script = await generateScript(body.gtin, body.city, body.lang, median);
    const payload = { median, lang: body.lang, ...script };
    cache.set(key, { ts: Date.now(), payload });
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function generateScript(gtin: string, city: string, lang: 'ta' | 'hi' | 'en', fairMedian: number) {
  const product = await lookupGTIN(gtin);
  const overpriced = Math.round(fairMedian * 1.13);
  const counter = Math.round(fairMedian * 0.95);
  const finalOffer = Math.round(fairMedian * 0.97);

  const languageHint = {
    ta: 'Tamil. Use transliterated Tamil for shopkeeper and oracle, English for supplier. Colloquial Madurai register. Keep each line under 12 words.',
    hi: 'Hindi. Use Devanagari script. Colloquial Tier-2 register. Keep each line under 12 words.',
    en: 'English. Colloquial, slightly aggressive Indian wholesale-market register. Keep each line under 10 words.',
  }[lang];

  const prompt = `Generate a 7-line haggling script for ${product.name} in ${city}.

Context:
  - The shopkeeper is buying from a wholesale supplier.
  - The FAIR price is ₹${fairMedian} (the oracle's recommended median).
  - The supplier will quote ₹${overpriced} (overpriced).
  - The shopkeeper's target is to settle at ₹${finalOffer}.
  - MARGINS (the oracle) is whispering sharp one-liners in ${languageHint}

Roles:
  - 'supplier' (3 lines): starts at ₹${overpriced}, then ₹${Math.round(overpriced * 0.97)}, then concedes to ₹${Math.round(overpriced * 0.93)}
  - 'shopkeeper' (2 lines): pushes back with the fair price, then a final counter
  - 'oracle' (2 lines): one-liner strategic whisper at the right moments

Output JSON:
{
  "lines": [
    { "role": "supplier|shopkeeper|oracle", "text": "...", "lang": "ta|hi|en" }
  ],
  "verdict_after": "settled_at_263"
}

Rules:
  - supplier speaks only English (so the shopkeeper can compare what the supplier says with what the oracle whispers)
  - shopkeeper and oracle use the target language (${lang})
  - first supplier line: "${overpriced} per kg, no discount, take it or leave it" type attitude
  - oracle's first whisper: tell shopkeeper the exact number to counter with and one sharp line to say
  - final supplier line: "Okay, ₹${Math.round(overpriced * 0.93)} final, take it" (relenting)
  - final oracle line: "Settle at ₹${finalOffer}. Saved ₹X."

Output ONLY the JSON. No prose.`;

  let text: string;
  try {
    const out = await proModel().generateContent(prompt);
    text = out.response.text();
  } catch {
    const out = await flashModel().generateContent(prompt);
    text = out.response.text();
  }
  const parsed = JSON.parse(text);
  return { lines: parsed.lines, generated_by: MODELS.pro };
}