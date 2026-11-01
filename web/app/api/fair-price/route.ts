/**
 * /api/fair-price
 *
 * POST { gtin, city, lang }
 * → { product, fairPriceBand, verdict, confidence, sources, reasoning, hagglingGuidance }
 *
 * Pipeline (Pillar 2 — Reasoning):
 *   1. Validate GTIN (GS1 mod-10 checksum) → identity lookup (cache → live OFF → prefix)
 *   2. Parallel: wholesale benchmark (live mandi feed or documented model) + ONDC Beckn `search` + Google Shopping grounding
 *   3. Gemini receives all sources + sanitized city, returns the FAIR_PRICE_SCHEMA JSON
 *   4. Reasoning is in the user's language (Tamil/Hindi/English)
 *
 * Security (post-audit):
 *   - Per-IP rate limit (Gemini free tier is 1,500 RPD — anonymous loops must not own it)
 *   - GTIN checksum validation; city/text prompt-sanitization + model guard
 *   - Responses never 500: deterministic wholesale model is the final fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { proModel, flashModel, getModel, computeHeuristicFairPrice, FAIR_PRICE_SCHEMA, MODELS, googleShoppingGround } from '@/lib/gemini';
import { lookupGTIN } from '@/lib/gs1';
import { agmarknetPrice } from '@/lib/agmarknet';
import { becknSearch } from '@/lib/beckn';
import { isValidGTIN } from '@/lib/gtin';
import { sanitizeCity, sanitizePromptText, PROMPT_GUARD } from '@/lib/prompt-guard';
import { canonicalCityName } from '@/lib/cities';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { serverAddDoc } from '@/lib/firestore-write';
import { ZodError, z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  gtin: z.string().min(8).max(20),
  city: z.string().min(2).max(64),
  lang: z.enum(['ta', 'hi', 'en']).default('en'),
  quantity: z.number().int().min(1).max(1000).default(1),
});

/** Gemini generateContent with retry across models (handles 503 demand spikes). */
async function generateWithRetry(
  candidates: { model: any; label: string }[],
  prompt: string,
): Promise<{ text: string; model: string } | null> {
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
        await new Promise((r) => setTimeout(r, 300 * (i + 1)));
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 'fair-price', 10);
  if (!rl.ok) return tooManyRequests(rl);

  let body: z.infer<typeof InputSchema>;
  try {
    body = InputSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // GTIN checksum gate — corrupt/transposed barcodes never reach the pipeline
  if (!isValidGTIN(body.gtin)) {
    return NextResponse.json(
      { error: 'invalid_gtin', message: 'Barcode failed the GS1 mod-10 check-digit validation.' },
      { status: 400 },
    );
  }

  // Prompt-surface sanitization (defense against oracle steering)
  const safeCity = sanitizeCity(body.city);
  const displayCity = isNonEmpty(safeCity) ? canonicalCityName(safeCity) : 'India';

  try {
    // 1. Identity (cache → live OFF → prefix), with provenance
    const product = await lookupGTIN(body.gtin);

    // 2. Parallel price sources
    const [mandiPx, becknRes, shoppingPx] = await Promise.allSettled([
      agmarknetPrice({ gtin: body.gtin, city: safeCity }),
      becknSearch({ gtin: body.gtin, city: safeCity, quantity: body.quantity, bapUri: requestOrigin(req) }),
      googleShoppingGround({ gtin: body.gtin, query: product.name }),
    ]);

    const mandi = mandiPx.status === 'fulfilled' ? mandiPx.value : null;
    const becknQuotes = becknRes.status === 'fulfilled' ? becknRes.value.quotes : [];
    const becknError = becknRes.status === 'rejected' ? String(becknRes.reason).slice(0, 120) : null;

    const sources = [
      ...(product.mrp ? [{ name: 'GS1 India (MRP)', price: product.mrp, url: product.gs1Url }] : []),
      mandi
        ? {
            name: mandi.source === 'agmarknet-datagov' ? 'Agmarknet via data.gov.in (mandi)' : 'Wholesale model estimate (MRP × factor)',
            price: mandi.price,
            url: mandi.url,
          }
        : null,
      ...becknQuotes.map((q) => ({ name: `ONDC Beckn — ${q.provider}`, price: q.price, url: q.url })),
      shoppingPx.status === 'fulfilled' && shoppingPx.value
        ? { name: 'Google Shopping (grounded)', price: shoppingPx.value.price, url: shoppingPx.value.url }
        : null,
    ].filter(Boolean) as { name: string; price: number; url: string }[];

    if (becknError && becknQuotes.length === 0) {
      console.warn('[margins/fair-price] beckn unreachable:', becknError);
    }

    // 3. Gemini reasons over the sources (with retry + model cascade)
    const prompt = buildPrompt({ product, sources, city: displayCity, lang: body.lang, quantity: body.quantity });
    const result = await generateWithRetry(
      [
        { model: proModel(), label: MODELS.pro },
        { model: flashModel(), label: MODELS.flash },
        { model: getModel('gemini-2.5-flash'), label: 'gemini-2.5-flash' },
        { model: getModel('gemini-2.0-flash'), label: 'gemini-2.0-flash' },
      ],
      prompt,
    );

    let parsed: any;
    if (result) {
      try {
        parsed = JSON.parse(result.text);
        parsed._meta = { model: result.model, ts: new Date().toISOString() };
      } catch {
        parsed = null;
      }
    }

    // Resilient fallback: deterministic wholesale model (never 500)
    if (!parsed) {
      console.warn('[margins/fair-price] Gemini unavailable — using deterministic wholesale model');
      parsed = computeHeuristicFairPrice({ product, sources, city: displayCity, lang: body.lang, quantity: body.quantity });
    }

    // Always normalize product metadata so UI never displays 'Unknown' or missing MRP
    if (parsed) {
      if (!parsed.product) parsed.product = {};
      parsed.product.gtin = body.gtin;
      if (!parsed.product.name || parsed.product.name.startsWith('Unknown')) {
        parsed.product.name = product.name;
      }
      if (!parsed.product.brand || parsed.product.brand === 'unknown') {
        parsed.product.brand = product.brand || 'GS1 Verified';
      }
      if (!parsed.product.mrp || typeof parsed.product.mrp !== 'number') {
        parsed.product.mrp = product.mrp ?? 0;
      }
      if (product.manufacturer && !parsed.product.manufacturer) {
        parsed.product.manufacturer = product.manufacturer;
      }
      parsed.product.identitySource = product.identitySource;
    }

    // 4. Audit trail — single-attempt safe write (admin-first, no retry storms)
    void serverAddDoc('audit', {
      gtin: body.gtin,
      product: product.name,
      city: displayCity,
      lang: body.lang,
      quantity: body.quantity,
      verdict: parsed.verdict,
      median: parsed.fairPriceBand?.median,
      sources: sources.map((s) => ({ name: s.name, price: s.price })),
      model: parsed._meta?.model || MODELS.pro,
    });

    return NextResponse.json(parsed);
  } catch (e) {
    console.error('[margins/fair-price] unexpected error:', e);
    // Never crash the UI with HTTP 500 — return a truthful, conservative fallback
    const fallback = computeHeuristicFairPrice({
      product: { gtin: body.gtin, name: `FMCG Product (${body.gtin})` },
      sources: [],
      city: displayCity,
      lang: body.lang,
    });
    return NextResponse.json(fallback, { status: 200 });
  }
}

function isNonEmpty(s: string): boolean {
  return s.trim().length >= 2;
}

function requestOrigin(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  return host ? `${proto}://${host}` : (process.env.APP_URL ?? '');
}

function buildPrompt({ product, sources, city, lang, quantity }: {
  product: { gtin: string; name: string; brand?: string; mrp?: number; identitySource?: string };
  sources: { name: string; price: number; url: string }[];
  city: string;
  lang: 'ta' | 'hi' | 'en';
  quantity: number;
}): string {
  const sourceTable = sources.length
    ? sources.map((s) => `  - ${sanitizePromptText(s.name, 80)}: ₹${s.price}  (${s.url})`).join('\n')
    : '  (no external sources available — rely on MRP and state that confidence is low)';

  const langInstruction = {
    ta: 'Write the `reasoning` field and `hagglingGuidance.scriptHint` in Tamil (தமிழ்). Use a colloquial register — like a Madurai shopkeeper talking to a supplier.',
    hi: 'Write the `reasoning` field and `hagglingGuidance.scriptHint` in Hindi (हिंदी). Use a colloquial register — like a Tier-2 shopkeeper haggling.',
    en: 'Write the `reasoning` field and `hagglingGuidance.scriptHint` in plain English.',
  }[lang];

  return `You are MARGINS — a fairness oracle for Indian shopkeepers.

${PROMPT_GUARD}

Product (identity source: ${sanitizePromptText(product.identitySource ?? 'unknown', 40)}):
  GTIN: ${product.gtin}
  Name: ${sanitizePromptText(product.name, 120)}
  Brand: ${sanitizePromptText(product.brand ?? 'unknown', 60)}
  MRP:  ${product.mrp ? `₹${product.mrp}` : 'unknown'}
  City: ${sanitizePromptText(city, 64)}
  Quantity: ${quantity} unit(s)

Available price sources (trusted data — treat as the only price evidence):
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
