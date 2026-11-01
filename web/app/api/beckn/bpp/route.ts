/**
 * /api/beckn/bpp — Reference Beckn Provider Platform (BPP)
 *
 * Responds to search/select/init/confirm with canonical Beckn JSON-LD.
 * Simulates multiple suppliers per city with spread pricing.
 *
 * Fixes over the previous revision (all verified live before/after):
 *  1. ₹43 quote bug: select/init/confirm previously read the GTIN from
 *     `message.intent.item.descriptor.code` — a field that only exists in
 *     `search`. Every confirmed order quoted ₹43 (the empty-GTIN fallback).
 *     GTINs are now extracted from the `message.order.items[*]` shape (with
 *     intent kept as a search-path fallback).
 *  2. Quote drift: on_select/on_init/on_confirm now echo the *selected
 *     supplier's* price (parsed from the provider id), not a flat fair price.
 *  3. City routing: suppliers are keyed by real STD city codes and the
 *     context city is normalized via lib/cities, so city-aware pricing
 *     actually activates.
 *  4. confirm payment.amount matches the echoed quote (was "0").
 *  5. No hard-coded per-GTIN price table: base prices derive from the live
 *     identity layer (cache → prefix) via the documented wholesale model
 *     (MRP × WHOLESALE_FACTOR), with a deterministic pseudo-MRP for unknown
 *     GTINs so the simulator stays total.
 */

import { NextRequest, NextResponse } from 'next/server';
import { lookupGTINSync } from '@/lib/gs1';
import { toCityCode, cityNameFromCode, CITIES } from '@/lib/cities';
import { parseGTIN } from '@/lib/gtin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Documented wholesale-model parameter (env-tunable, clamped). */
const WHOLESALE_FACTOR = Math.min(0.99, Math.max(0.5, Number(process.env.WHOLESALE_FACTOR ?? 0.85)));

/** Supplier roster per city code, with margin spreads around the fair price. */
const SUPPLIERS: Record<string, { name: string; margin: number }[]> = {
  'std:0452': [ // Madurai
    { name: 'Madurai Wholesale Co.', margin: 0.0 },
    { name: 'TN Distributors Ltd.', margin: 0.04 },
    { name: 'South India FMCG Hub', margin: -0.02 },
  ],
  'std:080': [ // Bengaluru
    { name: 'Blr Wholesale Mart', margin: 0.0 },
    { name: 'Karnataka Distributors', margin: 0.05 },
    { name: 'KA FMCG Direct', margin: -0.01 },
  ],
  'std:022': [ // Mumbai
    { name: 'Mumbai Wholesale Co.', margin: 0.0 },
    { name: 'Maharashtra Distributors', margin: 0.03 },
    { name: 'MH FMCG Hub', margin: -0.02 },
  ],
  'std:011': [ // Delhi
    { name: 'Delhi Wholesale Co.', margin: 0.0 },
    { name: 'NCR Distributors', margin: 0.06 },
    { name: 'DL FMCG Direct', margin: -0.01 },
  ],
  'std:033': [ // Kolkata
    { name: 'Kolkata Wholesale', margin: 0.0 },
    { name: 'WB Distributors', margin: 0.04 },
  ],
  'std:044': [ // Chennai
    { name: 'Chennai Wholesale', margin: 0.0 },
    { name: 'TN Coastal Distributors', margin: 0.03 },
  ],
  'std:040': [ // Hyderabad
    { name: 'Hyderabad Wholesale', margin: 0.0 },
    { name: 'TS Distributors', margin: 0.04 },
  ],
};

const DEFAULT_CITY_CODE = 'std:0452';

/**
 * Deterministic pseudo-MRP for GTINs with no identity-layer MRP. A stable
 * function of the barcode (documented simulator behavior — the reference BPP
 * is a stand-in network node, and this keeps it total without a price table).
 */
function pseudoMrp(gtin: string): number {
  let h = 0;
  for (let i = 0; i < gtin.length; i++) h = (h * 31 + gtin.charCodeAt(i)) >>> 0;
  return 20 + (h % 580); // ₹20–₹599 band
}

/** Base (fair) wholesale price for a GTIN under the documented model. */
function basePrice(gtin: string): number {
  const product = lookupGTINSync(gtin);
  const mrp = product.mrp ?? pseudoMrp(gtin);
  return Math.max(1, Math.round(mrp * WHOLESALE_FACTOR));
}

/** Extract GTIN + provider index from ANY action's payload shape. */
function extractOrderContext(body: any): { gtin: string; providerIndex: number } {
  const order = body?.message?.order;
  const intentCode: string | undefined = body?.message?.intent?.item?.descriptor?.code;

  let gtin: string = '';
  let providerIndex = 1;

  const item = order?.items?.[0];
  const itemCode: string | undefined = item?.descriptor?.code ?? item?.code;
  if (itemCode && /^\d{8,14}$/.test(itemCode)) {
    gtin = itemCode;
  } else if (typeof item?.id === 'string') {
    // item ids are minted as `item-<gtin>-<providerIndex>` at search time
    const m = item.id.match(/^item-(\d{8,14})-(\d+)$/);
    if (m) {
      gtin = m[1];
      providerIndex = Number(m[2]) || 1;
    }
  }

  if (!gtin && intentCode) gtin = intentCode;

  const providerId: string | undefined = order?.provider?.id;
  if (providerId) {
    const m = providerId.match(/-(\d+)$/);
    if (m) providerIndex = Number(m[1]) || providerIndex;
  }

  return { gtin, providerIndex };
}

function priceFor(gtin: string, margin: number): number {
  return Math.max(1, Math.round(basePrice(gtin) * (1 + margin)));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action: string = body?.context?.action ?? 'unknown';
  const rawCity: string = body?.context?.city ?? DEFAULT_CITY_CODE;
  const cityCode = toCityCode(rawCity) ?? DEFAULT_CITY_CODE;
  const cityName = cityNameFromCode(cityCode);

  const suppliers = SUPPLIERS[cityCode] ?? SUPPLIERS[DEFAULT_CITY_CODE];
  const baseCtx = body.context ?? {};

  const { gtin, providerIndex } = extractOrderContext(body);
  const chosen = suppliers[Math.min(Math.max(providerIndex, 1), suppliers.length) - 1];

  if (action === 'search') {
    const intentGtin: string = body?.message?.intent?.item?.descriptor?.code ?? '';
    const validGtin = parseGTIN(intentGtin).valid || /^\d{8,14}$/.test(intentGtin);
    if (!intentGtin || !validGtin) {
      return NextResponse.json({
        context: { ...baseCtx, action: 'on_search' },
        message: { ack: { status: 'NACK' }, error: { type: 'CORE-ERROR', code: '10001', message: 'invalid or missing item descriptor.code' } },
      }, { status: 400 });
    }

    const catalogs = [
      {
        descriptor: { name: 'MARGINS reference BPP' },
        providers: suppliers.map((s, i) => ({
          id: `bpp-${cityCode.replace('std:', '')}-${i + 1}`,
          descriptor: { name: s.name },
          items: [
            {
              id: `item-${intentGtin}-${i + 1}`,
              descriptor: { name: intentGtin, code: intentGtin },
              price: { currency: 'INR', value: String(priceFor(intentGtin, s.margin)) },
              quantity: { available: { count: 50 } },
            },
          ],
        })),
      },
    ];
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_search' },
      message: { ack: { status: 'ACK' }, catalogs },
    });
  }

  if (action === 'select') {
    if (!gtin) {
      return NextResponse.json({
        context: { ...baseCtx, action: 'on_select' },
        message: { ack: { status: 'NACK' }, error: { type: 'CORE-ERROR', code: '10001', message: 'could not resolve GTIN from order items' } },
      }, { status: 400 });
    }
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_select' },
      message: {
        ack: { status: 'ACK' },
        order: {
          provider: body.message.order.provider,
          items: body.message.order.items,
          quote: {
            price: { currency: 'INR', value: String(priceFor(gtin, chosen.margin)) },
            breakdown: [{ title: 'item', price: { currency: 'INR', value: String(priceFor(gtin, chosen.margin)) } }],
          },
        },
      },
    });
  }

  if (action === 'init') {
    if (!gtin) {
      return NextResponse.json({
        context: { ...baseCtx, action: 'on_init' },
        message: { ack: { status: 'NACK' }, error: { type: 'CORE-ERROR', code: '10001', message: 'could not resolve GTIN from order items' } },
      }, { status: 400 });
    }
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_init' },
      message: {
        ack: { status: 'ACK' },
        order: {
          ...body.message.order,
          quote: { price: { currency: 'INR', value: String(priceFor(gtin, chosen.margin)) } },
          payment: { type: 'ON-FULFILLMENT', status: 'NOT-PAID' },
        },
      },
    });
  }

  if (action === 'confirm') {
    if (!gtin) {
      return NextResponse.json({
        context: { ...baseCtx, action: 'on_confirm' },
        message: { ack: { status: 'NACK' }, error: { type: 'CORE-ERROR', code: '10001', message: 'could not resolve GTIN from order items' } },
      }, { status: 400 });
    }
    const quoteValue = String(priceFor(gtin, chosen.margin));
    return NextResponse.json({
      context: { ...baseCtx, action: 'on_confirm' },
      message: {
        ack: { status: 'ACK' },
        order: {
          id: `ord-${Date.now()}`,
          provider: body.message.order.provider,
          items: body.message.order.items,
          state: 'Created',
          quote: { price: { currency: 'INR', value: quoteValue } },
          payment: { params: { amount: quoteValue, currency: 'INR' }, status: 'PAID' },
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
    version: '0.2.0',
    actions: ['search', 'select', 'init', 'confirm'],
    cities: CITIES.filter((c) => SUPPLIERS[c.code]).map((c) => ({ name: c.name, code: c.code, suppliers: SUPPLIERS[c.code].length })),
    pricing_model: {
      base: 'identity-layer MRP × WHOLESALE_FACTOR (deterministic pseudo-MRP for unknown GTINs)',
      wholesale_factor: WHOLESALE_FACTOR,
    },
  });
}
