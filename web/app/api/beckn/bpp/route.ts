/**
 * /api/beckn/bpp — Reference Beckn Provider Platform (BPP)
 *
 * Responds to search/select/init/confirm with canonical Beckn JSON-LD.
 * Simulates multiple suppliers per GTIN with city-aware pricing variation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { lookupGTINSync } from '@/lib/gs1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 3 mock suppliers with different pricing
const SUPPLIERS: Record<string, { name: string; city: string; margin: number }[]> = {
  default: [
    { name: 'Madurai Wholesale Co.', city: 'std:0625', margin: 0.0 },     // fair price
    { name: 'TN Distributors Ltd.', city: 'std:0625', margin: 0.04 },     // +4%
    { name: 'South India FMCG Hub', city: 'std:0625', margin: -0.02 },   // -2%
  ],
  Bengaluru: [
    { name: 'Blr Wholesale Mart', city: 'std:0800', margin: 0.0 },
    { name: 'Karnataka Distributors', city: 'std:0800', margin: 0.05 },
    { name: 'KA FMCG Direct', city: 'std:0800', margin: -0.01 },
  ],
  Mumbai: [
    { name: 'Mumbai Wholesale Co.', city: 'std:0820', margin: 0.0 },
    { name: 'Maharashtra Distributors', city: 'std:0820', margin: 0.03 },
    { name: 'MH FMCG Hub', city: 'std:0820', margin: -0.02 },
  ],
  Delhi: [
    { name: 'Delhi Wholesale Co.', city: 'std:0110', margin: 0.0 },
    { name: 'NCR Distributors', city: 'std:0110', margin: 0.06 },
    { name: 'DL FMCG Direct', city: 'std:0110', margin: -0.01 },
  ],
  Kolkata: [
    { name: 'Kolkata Wholesale', city: 'std:0700', margin: 0.0 },
    { name: 'WB Distributors', city: 'std:0700', margin: 0.04 },
  ],
  Chennai: [
    { name: 'Chennai Wholesale', city: 'std:0600', margin: 0.0 },
    { name: 'TN Coastal Distributors', city: 'std:0600', margin: 0.03 },
  ],
  Hyderabad: [
    { name: 'Hyderabad Wholesale', city: 'std:0500', margin: 0.0 },
    { name: 'TS Distributors', city: 'std:0500', margin: 0.04 },
  ],
};

// Fair-price baseline per GTIN (wholesale rate in INR)
const FAIR_PRICE: Record<string, number> = {
  '8901058851649': 252,  // Amul Butter 500g (MRP 280)
  '8901030865278': 95,   // Parle-G 1kg (MRP 110)
  '8901030383796': 65,   // Parle-G 800g (MRP 75)
  '8901058851427': 64,   // Amul Taaza Milk 1L (MRP 70)
  '8901063139466': 29,   // Britannia Bourbon 120g (MRP 35)
  '8901063012646': 25,   // Britannia Good Day Butter 100g (MRP 30)
  '8901063027879': 29,   // Britannia Good Day Cashew 100g (MRP 35)
  '8901063152526': 29,   // Britannia Marie Gold 250g (MRP 35)
  '8901057011013': 24,   // Tata Salt 1kg (MRP 28)
  '8901030865728': 24,   // Tata Salt 1kg (MRP 28)
  '8901057002011': 208,  // Tata Tea 500g (MRP 240)
  '8901052002542': 12,   // Maggi 70g (MRP 14)
  '8901052002573': 48,   // Maggi 4-pack (MRP 56)
  '8901725131238': 212,  // Aashirvaad Atta 5kg (MRP 245)
  '8906007280014': 126,  // Fortune Sunflower Oil 1L (MRP 145)
  '8901012111038': 55,   // Colgate Strong Teeth (MRP 65)
  '8901362001015': 122,  // Dettol 250ml (MRP 142)
};

function priceFor(gtin: string, margin: number): number {
  if (FAIR_PRICE[gtin]) {
    return Math.round(FAIR_PRICE[gtin] * (1 + margin));
  }
  const product = lookupGTINSync(gtin);
  const base = product.mrp ? Math.round(product.mrp * 0.85) : 30;
  return Math.round(base * (1 + margin));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action: string = body?.context?.action ?? 'unknown';
  const cityCode: string = body?.context?.city ?? 'std:0625';
  const gtin: string = body?.message?.intent?.item?.descriptor?.code ?? '';

  // Find the city name from the code (best-effort)
  const cityName = Object.entries(SUPPLIERS).find(([, list]) => list[0]?.city === cityCode)?.[0] ?? 'default';
  const suppliers = SUPPLIERS[cityName] ?? SUPPLIERS.default;

  const baseCtx = body.context;

  if (action === 'search') {
    const catalogs = [
      {
        descriptor: { name: 'MARGINS reference BPP' },
        providers: suppliers.map((s, i) => ({
          id: `bpp-${cityName.toLowerCase()}-${i + 1}`,
          descriptor: { name: s.name },
          items: [
            {
              id: `item-${gtin}-${i + 1}`,
              descriptor: { name: gtin, code: gtin },
              price: { currency: 'INR', value: String(priceFor(gtin, s.margin)) },
              quantity: { available: { count: 50 } },
            },
          ],
        })),
      },
    ];
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_search' },
      message: {
        ack: { status: 'ACK' },
        catalogs,
      },
    });
  }

  if (action === 'select') {
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_select' },
      message: {
        ack: { status: 'ACK' },
        order: {
          provider: body.message.order.provider,
          items: body.message.order.items,
          quote: { price: { currency: 'INR', value: String(priceFor(gtin, 0)) } },
        },
      },
    });
  }

  if (action === 'init') {
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_init' },
      message: {
        ack: { status: 'ACK' },
        order: {
          ...body.message.order,
          quote: { price: { currency: 'INR', value: String(priceFor(gtin, 0)) } },
          payment: { type: 'ON-FULFILLMENT', status: 'NOT-PAID' },
        },
      },
    });
  }

  if (action === 'confirm') {
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_confirm' },
      message: {
        ack: { status: 'ACK' },
        order: {
          id: `ord-${Date.now()}`,
          provider: body.message.order.provider,
          items: body.message.order.items,
          state: 'Created',
          quote: { price: { currency: 'INR', value: String(priceFor(gtin, 0)) } },
          payment: { status: 'PAID' },
          fulfillment: { tracking: false, state: 'Created' },
        },
      },
    });
  }

  return NextResponse.json({
    context: { ...baseCtx, action: `on_${action}` },
    message: { ack: { status: 'NAK' } },
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'MARGINS reference BPP',
    version: '0.1.0',
    actions: ['search', 'select', 'init', 'confirm'],
    suppliers: Object.fromEntries(Object.entries(SUPPLIERS).map(([k, v]) => [k, v.length])),
    fairPrices: FAIR_PRICE,
  });
}