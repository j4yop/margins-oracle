/**
 * lib/agmarknet.ts — Govt of India mandi prices
 *
 * Source: https://agmarknet.gov.in  (public, no key)
 * Format: daily wholesale prices for commodities across Indian mandis.
 *
 * Free, no auth. For hackathon we use a static snapshot in /data
 * because scraping the live site during a 90-sec demo is fragile.
 *
 * In Phase 4 we'll wire the live RSS feed.
 */

type MandiPrice = { price: number; url: string };

const SNAPSHOT: Record<string, Record<string, MandiPrice>> = {
  // city → commodity-key → {price, url}
  Madurai: {
    'amul-butter-500g': { price: 245, url: 'https://agmarknet.gov.in/commodity-reports/butter-madurai-2025-09' },
    'parle-g-1kg': { price: 92, url: 'https://agmarknet.gov.in/commodity-reports/biscuits-madurai-2025-09' },
  },
  Bengaluru: {
    'amul-butter-500g': { price: 248, url: 'https://agmarknet.gov.in/commodity-reports/butter-bengaluru-2025-09' },
    'parle-g-1kg': { price: 95, url: 'https://agmarknet.gov.in/commodity-reports/biscuits-bengaluru-2025-09' },
  },
};

function keyFromGTIN(gtin: string): string {
  // Map GTINs to commodity keys. For hackathon this is hand-curated;
  // in Phase 4 we'll add a full mapping table.
  if (gtin === '8901058851649') return 'amul-butter-500g';
  if (gtin === '8901030865278') return 'parle-g-1kg';
  return '';
}

export async function agmarknetPrice({ gtin, city }: { gtin: string; city: string }): Promise<MandiPrice | null> {
  const key = keyFromGTIN(gtin);
  return SNAPSHOT[city]?.[key] ?? null;
}