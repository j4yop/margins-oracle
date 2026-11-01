/**
 * lib/agmarknet.ts — wholesale benchmark layer
 *
 * The original implementation shipped a static hard-coded price snapshot
 * (12 products × 5 cities) presented as "Agmarknet (mandi)" data. That was
 * fabricated provenance — this module replaces it with an honest, live-first
 * benchmark pipeline:
 *
 *  1. Live mandi feed (only when DATA_GOV_IN_API_KEY is configured): the
 *     data.gov.in "Current Daily Price of Various Commodities from Various
 *     Markets" dataset (Agmarknet-sourced). Agricultural commodities only —
 *     branded FMCG has no mandi price, so a category→commodity mapping is
 *     used where it genuinely applies (staples, oils, produce).
 *  2. Documented wholesale model (always available): MRP × wholesale factor.
 *     This is a *model estimate*, and the source name says exactly that —
 *     no government API is claimed for it.
 *
 * Env:
 *   DATA_GOV_IN_API_KEY  — free key from data.gov.in (developer plan)
 *   WHOLESALE_FACTOR     — default 0.85, clamped 0.5–0.99
 */

import { lookupGTINSync } from './gs1';

export type MandiPrice = {
  price: number;
  url: string;
  /** Honest provenance for the UI + audit trail. */
  source: 'agmarknet-datagov' | 'model-estimate';
  /** For live feeds: the mandi/date the price refers to. */
  observedAt?: string;
};

const DATA_GOV_RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070'; // daily mandi prices dataset
const WHOLESALE_FACTOR = Math.min(0.99, Math.max(0.5, Number(process.env.WHOLESALE_FACTOR ?? 0.85)));

/** Only these categories have a true mandi (agricultural market) analogue. */
const CATEGORY_TO_COMMODITY: Record<string, string[]> = {
  'Staples': ['Wheat', 'Atta', 'Rice'],
  'Edible Oils': ['Sunflower', 'Groundnut', 'Mustard Oil'],
  'Beverages': ['Tea'],
};

function modelEstimate(gtin: string, city: string): MandiPrice | null {
  const product = lookupGTINSync(gtin);
  const mrp = product.mrp;
  if (!mrp || mrp <= 0) return null; // no fabricated MRP → no fabricated benchmark
  return {
    price: Math.round(mrp * WHOLESALE_FACTOR),
    url: `https://agmarknet.gov.in/SearchCmmdty.aspx`,
    source: 'model-estimate',
  };
}

export async function agmarknetPrice({ gtin, city }: { gtin: string; city: string }): Promise<MandiPrice | null> {
  const cleanGtin = gtin.trim();
  const product = lookupGTINSync(cleanGtin);

  // 1. Live mandi feed when a key is configured AND the product category has
  //    a real mandi analogue. Branded FMCG (biscuits, butter, soap) is
  //    intentionally NOT looked up in mandi feeds.
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  const commodities = product.category ? CATEGORY_TO_COMMODITY[product.category] : undefined;

  if (apiKey && commodities?.length) {
    try {
      const commodity = commodities[0];
      const state = ''; // dataset filters accept optional state/district
      const url =
        `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE}` +
        `?api-key=${encodeURIComponent(apiKey)}` +
        `&format=json&limit=10` +
        `&filters%5Bcommodity%5D=${encodeURIComponent(commodity)}` +
        (state ? `&filters%5Bstate%5D=${encodeURIComponent(state)}` : '');

      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 4000);
      const res = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const records: any[] = data?.records ?? [];
        const prices = records
          .map((r) => Number(r.min_price ?? r.min_price__rupees_quintal_ ?? NaN))
          .filter((n) => Number.isFinite(n) && n > 0);
        if (prices.length) {
          const perQuintal = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
          // Mandi prices are per quintal (100kg); convert to a per-kg band and
          // scale by the packaged size when the product name carries one.
          const perKg = perQuintal / 100;
          const sizeKg = sizeFromName(product.name);
          const estimate = sizeKg ? Math.max(1, Math.round(perKg * sizeKg * 1.1)) : null;
          if (estimate) {
            return {
              price: estimate,
              url: `https://data.gov.in/resource/${DATA_GOV_RESOURCE}`,
              source: 'agmarknet-datagov',
              observedAt: String(records[0]?.timestamp ?? ''),
            };
          }
        }
      }
    } catch {
      // fall through to the model estimate
    }
  }

  // 2. Documented model estimate (honest label)
  return modelEstimate(cleanGtin, city);
}

/** Extract a metric size (kg or L) from a product name, e.g. "5kg", "1L Pouch", "500 g". */
function sizeFromName(name: string): number | null {
  const m = name.match(/(\d+(?:\.\d+)?)\s*(kg|l|litre|liter)\b/i);
  if (m) return Number(m[1]);
  const g = name.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (g) return Number(g[1]) / 1000;
  const ml = name.match(/(\d+(?:\.\d+)?)\s*ml\b/i);
  if (ml) return Number(ml[1]) / 1000;
  return null;
}
