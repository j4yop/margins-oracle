/**
 * lib/gs1.ts — GTIN → product identity
 *
 * Free path: when GS1_API_KEY is set (sandbox approval), use the live API.
 * Fallback path: a hand-curated mock catalogue for the hackathon demo
 * so the team can demo without waiting on GS1 approval.
 */

type GS1Product = {
  gtin: string;
  name: string;
  brand?: string;
  mrp?: number;
  manufacturer?: string;
  gs1Url?: string;
};

const MOCK_CATALOGUE: Record<string, GS1Product> = {
  '8901058851649': {
    gtin: '8901058851649',
    name: 'Amul Salted Butter 500g',
    brand: 'Amul',
    mrp: 280,
    manufacturer: 'GCMMF (Amul)',
    gs1Url: 'https://www.gs1india.org/GTIN-lookup?gtin=8901058851649',
  },
  '8901030865278': {
    gtin: '8901030865278',
    name: 'Parle-G Gold Biscuits 1kg',
    brand: 'Parle',
    mrp: 110,
    manufacturer: 'Parle Products',
    gs1Url: 'https://www.gs1india.org/GTIN-lookup?gtin=8901030865278',
  },
  '8901058851427': {
    gtin: '8901058851427',
    name: 'Amul Taaza Toned Milk 1L',
    brand: 'Amul',
    mrp: 70,
    manufacturer: 'GCMMF',
    gs1Url: 'https://www.gs1india.org/GTIN-lookup?gtin=8901058851427',
  },
};

export async function lookupGTIN(gtin: string): Promise<GS1Product> {
  const mode = process.env.GS1_MODE ?? 'fallback';
  if (mode === 'live' && process.env.GS1_API_KEY) {
    // Phase 4: real GS1 API. For now, log and fall through.
    console.warn('[margins] GS1 live mode requested but adapter not implemented yet');
  }
  return (
    MOCK_CATALOGUE[gtin] ?? {
      gtin,
      name: `Unknown product (GTIN ${gtin})`,
      brand: 'unknown',
      gs1Url: `https://www.barcodespider.com/${gtin}`,
    }
  );
}