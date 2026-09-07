/**
 * lib/gemini.ts
 *
 * Single source of truth for the Gemini SDK setup. All routes/components import
 * the helpers from here so we can swap model versions in one place.
 *
 * This account (project 67005681731) has Flash-only access. We use:
 *   - gemini-3.1-flash-lite  → routing, summarisation, fast JSON
 *   - gemini-3.7-flash       → fair-price reasoning (handles schema + function calling)
 *   - gemini-2.0-flash-exp   → Live API (free preview)
 *   - gemini-embedding-2     → margins ledger vector index
 *
 * Structured output (responseSchema + responseMimeType: 'application/json')
 * is supported across all current Flash models. Function calling works too.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[margins] GEMINI_API_KEY missing — running in stub mode');
}

export const genai = new GoogleGenerativeAI(apiKey ?? 'STUB');

export const MODELS = {
  flash: process.env.GEMINI_MODEL_FLASH ?? 'gemini-3.1-flash-lite',
  pro: process.env.GEMINI_MODEL_PRO ?? 'gemini-3.7-flash',
  live: process.env.GEMINI_MODEL_LIVE ?? 'gemini-2.0-flash-exp',
  embed: process.env.GEMINI_MODEL_EMBED ?? 'gemini-embedding-2',
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

/** Embedding model — for the margins ledger vector index. */
export function embedModel() {
  return genai.getGenerativeModel({ model: MODELS.embed });
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