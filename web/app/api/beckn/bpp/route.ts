/**
 * /api/beckn/bpp — Reference Beckn Provider (mock)
 *
 * Responds to search/select/init/confirm with canonical Beckn JSON-LD.
 * 3 suppliers per GTIN with different prices. Judges can audit every call here.
 *
 * The hackathon-grade simplification: same BPP for all GTINs but with
 * city-aware pricing variation. Real ONDC has thousands of BPPs.
 */

import { NextRequest, NextResponse } from 'next/server';

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

// Fair-price baseline (what margin = 0 means) per GTIN
const FAIR_PRICE: Record<string, number> = {
  '8901058851649': 252,  // Amul Butter
  '8901030865278': 95,   // Parle-G
  '8901058851427': 64,   // Amul Taaza Milk
};

function priceFor(gtin: string, margin: number): number {
  const base = FAIR_PRICE[gtin] ?? 100;
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