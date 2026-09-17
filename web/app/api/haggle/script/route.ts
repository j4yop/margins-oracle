/**
 * /api/haggle/script
 *
 * Returns a generated haggling script based on the product's fair-price band and
 * payment terms (spot cash vs 15/30-day udhaar/credit).
 *
 * Pre-generates supplier quotes (overpriced), oracle whispers, shopkeeper responses,
 * and settlement line. Weaponizes working capital and credit terms as strategic leverage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proModel, flashModel, MODELS } from '@/lib/gemini';
import { lookupGTIN } from '@/lib/gs1';
import { becknSearch } from '@/lib/beckn';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  gtin: z.string().min(8),
  city: z.string().default('Madurai'),
  lang: z.enum(['ta', 'hi', 'en']).default('ta'),
  median: z.number().optional(),
  quantity: z.number().default(1),
  paymentTerms: z.enum(['cash', '15_days', '30_days']).default('15_days'),
});

const cache = new Map<string, { ts: number; payload: any }>();
const TTL = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = InputSchema.parse(await req.json());
    const key = `${body.gtin}-${body.city}-${body.lang}-${body.paymentTerms}-${body.median ?? 'auto'}`;
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

    const script = await generateScript(body.gtin, body.city, body.lang, median, body.paymentTerms);
    const payload = { median, lang: body.lang, paymentTerms: body.paymentTerms, ...script };
    cache.set(key, { ts: Date.now(), payload });
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function generateScript(
  gtin: string,
  city: string,
  lang: 'ta' | 'hi' | 'en',
  fairMedian: number,
  paymentTerms: 'cash' | '15_days' | '30_days'
) {
  const product = await lookupGTIN(gtin);
  const overpriced = Math.round(fairMedian * 1.13);

  // Adjust price target based on payment / credit terms
  const targetAdjustment = paymentTerms === 'cash' ? 0.94 : paymentTerms === '30_days' ? 1.01 : 0.97;
  const finalOffer = Math.round(fairMedian * targetAdjustment);

  const creditNarrative = {
    cash: 'Buyer is paying INSTANT CASH via UPI. Squeeze maximum 3-5% cash discount. If supplier balks, remind them cash in hand today beats credit risk.',
    '15_days': 'Standard 15-day wholesale credit (udhaar). If supplier refuses fair price, demand extension to 21 days or return privilege on unsold stock.',
    '30_days': 'Extended 30-day working capital credit. Supplier wants a premium for financing. Oracle allows up to +2% over median ONLY IF 30-day payment cycle and zero return fee are guaranteed.',
  }[paymentTerms];

  const languageHint = {
    ta: 'Tamil. Use transliterated Tamil for shopkeeper and oracle, English for supplier. Colloquial Madurai register. Keep each line under 12 words.',
    hi: 'Hindi. Use Devanagari script. Colloquial Tier-2 register. Keep each line under 12 words.',
    en: 'English. Colloquial, sharp Indian wholesale-market bazaar register. Keep each line under 10 words.',
  }[lang];

  const prompt = `Generate a 7-line haggling script for ${product.name} in ${city}.

Context:
  - The shopkeeper is buying from a wholesale distributor truck.
  - FAIR wholesale price is ₹${fairMedian}.
  - Supplier opens at ₹${overpriced} (inflated).
  - Target settlement: ₹${finalOffer}.
  - Payment terms leverage: ${creditNarrative}
  - MARGINS oracle whispers sharp tactical advice in ${languageHint}

Roles:
  - 'supplier' (3 lines): starts at ₹${overpriced}, resists with logistics/credit excuses, relents to ₹${finalOffer + 2}
  - 'shopkeeper' (2 lines): counters using fair-price data and payment terms leverage
  - 'oracle' (2 lines): tactical whisper showing exact number + leverage to deploy

Output JSON format strictly:
{
  "lines": [
    { "role": "supplier|shopkeeper|oracle", "text": "...", "lang": "ta|hi|en" }
  ],
  "verdict_after": "settled_at_${finalOffer}"
}

Rules:
  - supplier speaks English (distributor truck attitude)
  - shopkeeper and oracle speak ${lang}
  - include explicit mention of payment terms (${paymentTerms === 'cash' ? 'UPI cash settlement' : 'udhaar / credit days'}) in the negotiation
  - final oracle line must confirm settlement and exact savings vs MRP
  - Output ONLY valid JSON.`;

  try {
    const out = await proModel().generateContent(prompt);
    const parsed = JSON.parse(out.response.text());
    return { lines: parsed.lines, generated_by: MODELS.pro };
  } catch {
    try {
      const out = await flashModel().generateContent(prompt);
      const parsed = JSON.parse(out.response.text());
      return { lines: parsed.lines, generated_by: MODELS.flash };
    } catch {
      // High quality dynamic fallback tailored to payment terms
      const fallbackLines = [
        { role: 'supplier', text: `Anna, today ${product.name} is ₹${overpriced}. Fuel cost high.`, lang: 'en' },
        { role: 'shopkeeper', text: paymentTerms === 'cash' ? `Ready UPI cash kudukuren, ₹${finalOffer} final-aa?` : `₹${overpriced} too high. 15-day udhaar-la ₹${finalOffer} tharalama?`, lang: 'ta' },
        { role: 'supplier', text: `₹${finalOffer} not possible! Margin is too low brother.`, lang: 'en' },
        {
          role: 'oracle',
          text: paymentTerms === 'cash'
            ? `Tell him: "Spot cash UPI right now, settle at ₹${finalOffer} or I buy from next truck."`
            : `Tell him: "If ₹${finalOffer} not possible, give 25 days credit instead."`,
          lang: 'en'
        },
        { role: 'shopkeeper', text: `₹${finalOffer} final. Otherwise alternate distributor-kitta pesuren.`, lang: 'ta' },
        { role: 'supplier', text: `Okay, ₹${finalOffer} deal only for you. Don't tell other shops.`, lang: 'en' },
        { role: 'oracle', text: `Settle at ₹${finalOffer}. Terms: ${paymentTerms}. You saved ₹${(product.mrp ?? fairMedian) - finalOffer}.`, lang: 'en' },
      ];
      return { lines: fallbackLines, generated_by: 'fallback' };
    }
  }
}