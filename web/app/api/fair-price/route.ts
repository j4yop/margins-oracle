/**
 * /api/fair-price
 *
 * POST { gtin, city, lang }
 * → { product, fairPriceBand, verdict, confidence, sources, reasoning, hagglingGuidance }
 *
 * Pipeline (Pillar 2 — Reasoning):
 *   1. Look up GTIN → GS1 (or fallback)  → product identity + MRP
 *   2. Parallel call: Agmarknet (mandi) + ONDC Beckn `search` + Google Shopping grounding
 *   3. Gemini 2.5 Pro receives all sources + the user's city, returns the FAIR_PRICE_SCHEMA JSON
 *   4. Reasoning is in the user's language (Tamil/Hindi/English)
 *
 * Free tier:
 *   - Agmarknet: public RSS — no key
 *   - ONDC Beckn: reference BPP — local mock during dev
 *   - GS1:        fallback to mock catalogue when no key
 *   - Gemini Pro: free, 5 RPM (one call covers everything)
 */

import { NextRequest, NextResponse } from 'next/server';
import { proModel, flashModel, FAIR_PRICE_SCHEMA, MODELS } from '@/lib/gemini';
import { lookupGTIN } from '@/lib/gs1';
import { agmarknetPrice } from '@/lib/agmarknet';
import { becknSearch } from '@/lib/beckn';
import { ZodError, z } from 'zod';

/** Gemini generateContent with retry across models (handles 503 demand spikes). */
async function generateWithRetry(
  candidates: { model: any; label: string }[],
  prompt: string,
): Promise<{ text: string; model: string }> {
  let lastErr: unknown;
  for (const { model, label } of candidates) {
    for (let i = 0; i < 2; i++) {
      try {
        const out = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: FAIR_PRICE_SCHEMA,
          },
        });
        return { text: out.response.text(), model: label };
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
  }
  throw lastErr ?? new Error('all models failed');
}
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  gtin: z.string().min(8),
  city: z.string(),
  lang: z.enum(['ta', 'hi', 'en']).default('en'),
  quantity: z.number().default(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = InputSchema.parse(await req.json());

    // 1. GS1 / fallback product identity
    const product = await lookupGTIN(body.gtin);

    // 2. Parallel price sources
    const [mandiPx, becknRes, shoppingPx] = await Promise.allSettled([
      agmarknetPrice({ gtin: body.gtin, city: body.city }),
      becknSearch({ gtin: body.gtin, city: body.city, quantity: body.quantity }),
      googleShoppingGround({ gtin: body.gtin, query: product.name }),
    ]);

    const becknQuotes = becknRes.status === 'fulfilled' ? becknRes.value.quotes : [];
    const becknError = becknRes.status === 'rejected' ? String(becknRes.reason).slice(0, 120) : null;

    const sources = [
      ...(product.mrp ? [{ name: 'GS1 India (MRP)', price: product.mrp, url: product.gs1Url }] : []),
      mandiPx.status === 'fulfilled' && mandiPx.value ? { name: 'Agmarknet (mandi)', price: mandiPx.value.price, url: mandiPx.value.url } : null,
      ...becknQuotes.map((q) => ({ name: `ONDC Beckn — ${q.provider}`, price: q.price, url: q.url })),
      shoppingPx.status === 'fulfilled' && shoppingPx.value ? { name: 'Google Shopping', price: shoppingPx.value.price, url: shoppingPx.value.url } : null,
    ].filter(Boolean) as { name: string; price: number; url: string }[];

    // If we have zero Beckn quotes but BPP exists, surface that
    if (becknError && becknQuotes.length === 0) {
      console.warn('[margins/fair-price] beckn unreachable:', becknError);
    }

    // 3. Gemini reasons over the sources (with retry + flash fallback)
    const prompt = buildPrompt({ product, sources, city: body.city, lang: body.lang, quantity: body.quantity });
    const result = await generateWithRetry([
      { model: proModel(), label: 'pro' },
      { model: flashModel(), label: 'flash-fallback' },
    ], prompt);

    const parsed = JSON.parse(result.text);
    // Stamp Gemini model version onto the response for audit trail
    parsed._meta = { model: result.model, ts: new Date().toISOString() };

    // 4. Audit trail — fire-and-forget so Firestore latency never blocks the response
    void (async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'audit'), {
          gtin: body.gtin,
          product: product.name,
          city: body.city,
          lang: body.lang,
          quantity: body.quantity,
          verdict: parsed.verdict,
          median: parsed.fairPriceBand?.median,
          sources: sources.map((s) => ({ name: s.name, price: s.price })),
          model: MODELS.pro,
          timestamp: serverTimestamp(),
        });
      } catch {
        // best-effort: ignore all errors
      }
    })();

    return NextResponse.json(parsed);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function buildPrompt({ product, sources, city, lang, quantity }: {
  product: { gtin: string; name: string; brand?: string; mrp?: number };
  sources: { name: string; price: number; url: string }[];
  city: string;
  lang: 'ta' | 'hi' | 'en';
  quantity: number;
}): string {
  const sourceTable = sources.length
    ? sources.map((s) => `  - ${s.name}: ₹${s.price}  (${s.url})`).join('\n')
    : '  (no external sources available — rely on MRP + your knowledge)';

  const langInstruction = {
    ta: 'Write the `reasoning` field and `hagglingGuidance.scriptHint` in Tamil (தமிழ்). Use a colloquial register — like a Madurai shopkeeper talking to a supplier.',
    hi: 'Write the `reasoning` field and `hagglingGuidance.scriptHint` in Hindi (हिंदी). Use a colloquial register — like a Tier-2 shopkeeper haggling.',
    en: 'Write the `reasoning` field and `hagglingGuidance.scriptHint` in plain English.',
  }[lang];

  return `You are MARGINS — a fairness oracle for Indian shopkeepers.

Product:
  GTIN: ${product.gtin}
  Name: ${product.name}
  Brand: ${product.brand ?? 'unknown'}
  MRP:  ${product.mrp ? `₹${product.mrp}` : 'unknown'}
  City: ${city}
  Quantity: ${quantity} unit(s)

Available price sources:
${sourceTable}

Your task:
  1. Compute a fair-price band (low = 25th percentile of real sources, high = 75th percentile).
  2. Set verdict:
     - 'overpriced' if median source price > MRP × 1.0 (supplier is at or above sticker)
     - 'fair'      if median is within 70–95% of MRP
     - 'underpriced' if median < 60% of MRP (rare — verify before flagging)
     - 'insufficient_data' if you have < 2 sources
  3. Confidence: 0.95 when ≥4 sources, 0.7 with 2–3, 0.4 with 1, 0.2 with none.
  4. Set hagglingGuidance.openingOffer = median × 0.85; walkAway = median × 1.05.
  5. ${langInstruction}
  6. Always include every source you used in the \`sources\` array with its URL.

Output must strictly conform to the provided schema. No prose outside the JSON.`;
}

// TODO in Phase 4 — flesh out the Google Search grounding helper.
async function googleShoppingGround({ gtin, query }: { gtin: string; query: string }): Promise<{ price: number; url: string } | null> {
  // Phase 4: wire this via Gemini's google_search tool. For now return null.
  // The free-tier search grounding counts toward the Flash/Pro daily quota — use sparingly.
  void gtin; void query;
  return null;
}