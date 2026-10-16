/**
 * lib/demo-products.ts — Pre-cached sample products for the demo.
 *
 * Each entry has the GTIN, product name, expected fair price, and a
 * barcodespider URL that users can scan to verify barcode data.
 *
 * Covers multiple categories: FMCG, beverages, household, and snacks.
 */

export type DemoProduct = {
  gtin: string;
  name: string;
  brand: string;
  category: 'FMCG' | 'Beverages' | 'Household' | 'Snacks';
  emoji: string;        // for visual pickability
  image: string;        // SVG or URL — SVG so no asset deps
  expectedBand: [number, number];
  city: string;
  story: string;        // one-liner for the picker card
};

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    gtin: '8901063139466',
    name: 'Britannia Bourbon Biscuits 120g',
    brand: 'Britannia',
    category: 'Snacks',
    emoji: '🍫',
    image: '',
    expectedBand: [28, 31],
    city: 'Madurai',
    story: 'MRP ₹35. High demand choco-crème biscuit. Suppliers try ₹33–34; fair wholesale benchmark is ₹29.',
  },
  {
    gtin: '8901058851649',
    name: 'Amul Salted Butter 500g',
    brand: 'Amul',
    category: 'FMCG',
    emoji: '🧈',
    image: '',
    expectedBand: [248, 258],
    city: 'Madurai',
    story: 'The classic. Every Madurai kirana knows this barcode. Suppliers quote ₹285, fair price is ₹252.',
  },
  {
    gtin: '8901030865278',
    name: 'Parle-G Gold Biscuits 1kg',
    brand: 'Parle',
    category: 'Snacks',
    emoji: '🍪',
    image: '',
    expectedBand: [92, 99],
    city: 'Madurai',
    story: 'High volume, low margin. Beat the 8% supplier mark-up.',
  },
  {
    gtin: '8901058851427',
    name: 'Amul Taaza Toned Milk 1L',
    brand: 'Amul',
    category: 'Beverages',
    emoji: '🥛',
    image: '',
    expectedBand: [60, 66],
    city: 'Bengaluru',
    story: 'Daily fresh — the price leaks here are small but constant.',
  },
  {
    gtin: '8901057011013',
    name: 'Tata Salt 1kg',
    brand: 'Tata Salt',
    category: 'Household',
    emoji: '🧂',
    image: '',
    expectedBand: [22, 26],
    city: 'Delhi',
    story: 'MRP ₹28, but suppliers cluster at ₹25–27. Predictable, easy win.',
  },
  {
    gtin: '8906007280014',
    name: 'Fortune Sunflower Oil 1L',
    brand: 'Fortune',
    category: 'FMCG',
    emoji: '🌻',
    image: '',
    expectedBand: [124, 130],
    city: 'Chennai',
    story: 'MRP ₹145. Edible oil mandi benchmark ensures fair margin of ₹18/pouch.',
  },
];

export function productByGtin(gtin: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.gtin === gtin);
}