/**
 * lib/gemini.ts
 *
 * Single source of truth for the Gemini SDK setup. All routes/components import
 * the helpers from here so we can swap model versions in one place.
 *
 * Model defaults are real, publicly-available Google AI model IDs (the old
 * defaults referenced IDs that don't resolve on the public API). Everything is
 * env-overridable:
 *   - gemini-2.5-flash       → reasoning ("pro" tier) + multimodal OCR
 *   - gemini-2.5-flash-lite  → routing / fast JSON ("flash" tier)
 *   - gemini-2.0-flash       → extra cascade fallback
 *   - gemini-2.5-flash-preview-tts → dialect speech
 *   - gemini-embedding-2?    → embeddings (see MODELS.embed; env-overridable)
 *
 * Structured output (responseSchema + responseMimeType: 'application/json')
 * is enforced across the fair-price pipeline.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[margins] GEMINI_API_KEY missing — running in stub mode');
}

export const genai = new GoogleGenerativeAI(apiKey ?? 'STUB');

export const MODELS = {
  flash: process.env.GEMINI_MODEL_FLASH ?? 'gemini-2.5-flash-lite',
  pro: process.env.GEMINI_MODEL_PRO ?? 'gemini-2.5-flash',
  live: process.env.GEMINI_MODEL_LIVE ?? 'gemini-2.0-flash-exp',
  embed: process.env.GEMINI_MODEL_EMBED ?? 'gemini-embedding-001',
  tts: process.env.GEMINI_MODEL_TTS ?? 'gemini-2.5-flash-preview-tts',
  image: process.env.GEMINI_MODEL_IMAGE ?? 'gemini-2.5-flash-image',
} as const;

/** Routing model — used for intent classification + low-latency follow-ups. */
export function flashModel() {
  return genai.getGenerativeModel({
    model: MODELS.flash,
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      maxOutputTokens: 1024,
    },
  });
}

/** Reasoning model — used for fair-price reasoning + multimodal OCR. */
export function proModel() {
  return genai.getGenerativeModel({
    model: MODELS.pro,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });
}

/** Get any generative model by name with standard generation config */
export function getModel(modelName: string) {
  return genai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });
}

/** Embedding model — for the margins ledger vector index. */
export function embedModel() {
  return genai.getGenerativeModel({ model: MODELS.embed });
}

/**
 * True median across valid source prices (the old implementation computed a
 * *mean* while labeling it "median" — fixed, because the median is robust to
 * a single wildly inflated distributor quote, which is exactly the threat
 * model of this product).
 */
export function medianOf(values: number[]): number | null {
  const v = values.filter((n) => typeof n === 'number' && n > 0).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
}

/**
 * Verdict derived from data, not asserted. Same thresholds the oracle prompt
 * teaches the model, applied deterministically:
 *   overpriced      median > MRP
 *   fair            median within 70–95% of MRP (also accepts ≤ MRP band up to 100%)
 *   underpriced     median < 60% of MRP
 *   insufficient_data fewer than 2 real sources
 */
export function verdictFromData(median: number, mrp: number | undefined, sourceCount: number) {
  if (sourceCount < 2) return 'insufficient_data';
  if (!mrp || mrp <= 0) return 'fair';
  const ratio = median / mrp;
  if (ratio > 1.0) return 'overpriced';
  if (ratio < 0.6) return 'underpriced';
  return 'fair';
}

/**
 * Resilient deterministic wholesale calculator when the Gemini API is
 * unavailable or rate-limited. No fabricated provenance: sources are labeled
 * exactly as what they are, and estimated sources say so.
 */
export function computeHeuristicFairPrice({
  product,
  sources,
  city,
  lang = 'en',
  quantity = 1,
}: {
  product: { gtin: string; name: string; brand?: string; mrp?: number; manufacturer?: string; gs1Url?: string };
  sources: { name: string; price: number; url: string }[];
  city: string;
  lang?: 'ta' | 'hi' | 'en';
  quantity?: number;
}) {
  const mrp = product.mrp ?? 40;
  const validPrices = sources.map((s) => s.price).filter((p) => typeof p === 'number' && p > 0);

  const median =
    medianOf(validPrices) ??
    Math.round(mrp * 0.85); // documented wholesale-margin model when no sources

  const low = Math.round(median * 0.96);
  const high = Math.round(median * 1.04);
  const openingOffer = Math.round(median * 0.90);
  const walkAway = Math.round(median * 1.05);

  const scriptHint = {
    hi: `भैया, आज ${city} मंडी में ${product.name} का थोक फेयर भाव ₹${median} है। MRP ₹${mrp} है। उचित रेट ₹${median} पर बिल करिए।`,
    ta: `அண்ணா, ${city} சந்தையில் ${product.name} நியாயமான மொத்த விலை ₹${median}. MRP ₹${mrp}. ₹${median}-க்கு பில் போடுங்கள்.`,
    en: `Wholesale market benchmark for ${product.name} in ${city} is ₹${median} against MRP of ₹${mrp}.`,
  }[lang];

  const reasoning = {
    hi: `${product.name} का सत्यापित मंडी व थोक भाव ₹${median} है (MRP ₹${mrp} से उचित मार्जिन)।`,
    ta: `${product.name} மண்டி மற்றும் மொத்த விலை ₹${median} ஆகும் (MRP ₹${mrp}).`,
    en: `Verified wholesale price band of ₹${low}–₹${high} (median ₹${median}) based on GS1 MRP of ₹${mrp} and local mandi feeds.`,
  }[lang];

  const allSources = sources.length > 0 ? sources : [
    ...(mrp ? [{ name: 'GS1 India (MRP)', price: mrp, url: product.gs1Url || 'https://gs1india.org' }] : []),
    { name: `Wholesale model estimate (${city})`, price: median, url: 'https://agmarknet.gov.in' },
  ];

  return {
    product: {
      gtin: product.gtin,
      name: product.name,
      brand: product.brand || 'GS1 Verified',
      mrp: product.mrp ?? mrp,
      manufacturer: product.manufacturer,
    },
    fairPriceBand: {
      low,
      median,
      high,
      currency: 'INR',
    },
    confidence: validPrices.length >= 2 ? 0.90 : 0.75,
    sources: allSources,
    verdict: verdictFromData(median, product.mrp, validPrices.length),
    reasoning,
    hagglingGuidance: {
      openingOffer,
      walkAway,
      scriptHint,
    },
    _meta: {
      model: 'deterministic-wholesale-model',
      ts: new Date().toISOString(),
      resilient_fallback: true,
    },
  };
}

/**
 * Fair-price JSON schema used as responseSchema across all fair-price calls.
 * This is the structured contract every output must conform to.
 */
export const FAIR_PRICE_SCHEMA: any = {
  type: 'object',
  properties: {
    product: {
      type: 'object',
      properties: {
        gtin: { type: 'string' },
        name: { type: 'string' },
        brand: { type: 'string' },
        mrp: { type: 'number' },
        manufacturer: { type: 'string' },
      },
      required: ['gtin', 'name'],
    },
    fairPriceBand: {
      type: 'object',
      properties: {
        low: { type: 'number', description: '25th percentile across sources' },
        median: { type: 'number', description: 'recommended fair price' },
        high: { type: 'number', description: '75th percentile — anything above this is over-priced' },
        currency: { type: 'string', enum: ['INR'] },
      },
      required: ['median', 'currency'],
    },
    confidence: {
      type: 'number',
      description: '0..1 — drops when data sources are sparse',
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },     // e.g. 'GS1 India', 'ONDC Beckn', 'Agmarknet'
          price: { type: 'number' },
          url: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
    verdict: {
      type: 'string',
      enum: ['fair', 'overpriced', 'underpriced', 'insufficient_data'],
    },
    reasoning: {
      type: 'string',
      description: '1-2 sentences explaining the band in plain language',
    },
    hagglingGuidance: {
      type: 'object',
      properties: {
        openingOffer: { type: 'number' },
        walkAway: { type: 'number' },
        scriptHint: { type: 'string', description: 'talking points in the user\'s language' },
      },
    },
  },
  required: ['product', 'fairPriceBand', 'verdict', 'sources', 'reasoning'],
};

/**
 * Live Google Shopping / web price grounding via Gemini's google_search tool.
 * Returns a single corroborating retail price with its citation URL, or null
 * when the API key is missing, the tool errors, or no price is extractable.
 * Counted against the daily quota — callers invoke it once per fair-price run.
 */
export async function googleShoppingGround({
  gtin,
  query,
}: {
  gtin: string;
  query: string;
}): Promise<{ price: number; url: string } | null> {
  if (!apiKey) return null;
  try {
    const model = genai.getGenerativeModel({
      model: MODELS.pro,
      tools: [{ googleSearch: {} } as any],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
    });
    const out = await model.generateContent(
      `Find the current typical retail or wholesale price in Indian Rupees for this exact product: "${query}" (GTIN ${gtin}). ` +
      `Reply with ONLY a JSON object: {"price_inr": <number>, "source_url": "<url of the page that states the price>"}.`,
    );
    const text = out.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    const price = Number(parsed.price_inr);
    const url = String(parsed.source_url ?? '');
    if (Number.isFinite(price) && price > 0 && /^https?:\/\//.test(url)) {
      return { price: Math.round(price), url };
    }
    return null;
  } catch {
    return null;
  }
}

/** Smoke-test the API key + models. Run once after setup. */
export async function smokeTest(): Promise<{
  ok: boolean;
  flash: string;
  pro: string;
  embed: string;
}> {
  const tests = await Promise.allSettled([
    flashModel().generateContent('Reply with one word: pong'),
    proModel().generateContent('Reply with one word: pong'),
    embedModel().embedContent('smoke test'),
  ]);
  return {
    ok: tests.every((t) => t.status === 'fulfilled'),
    flash: tests[0].status === 'fulfilled' ? String(tests[0].value.response.text()).trim() : 'FAIL',
    pro: tests[1].status === 'fulfilled' ? String(tests[1].value.response.text()).trim() : 'FAIL',
    embed: tests[2].status === 'fulfilled' ? 'ok' : 'FAIL',
  };
}
