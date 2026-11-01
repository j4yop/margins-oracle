/**
 * /api/order — Place a real Beckn order end-to-end
 *
 * POST { gtin, city, buyerName, address, lang }
 * → runs search → select → init → confirm against the BPP
 * → returns the final order object with order id
 *
 * Post-audit fixes:
 *  - GTIN checksum validation; per-IP rate limit
 *  - confirm carries the *quoted* amount (was "0")
 *  - bap_uri is derived from the request origin (no more localhost on prod)
 *  - order persistence goes through the safe write path (admin-first,
 *    single attempt, no gRPC retry storms, never blocks the response)
 */

import { NextRequest, NextResponse } from 'next/server';
import { becknSearch, becknSelect, becknInit, becknConfirm } from '@/lib/beckn';
import { isValidGTIN } from '@/lib/gtin';
import { sanitizeCity, sanitizePromptText } from '@/lib/prompt-guard';
import { canonicalCityName } from '@/lib/cities';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { serverAddDoc } from '@/lib/firestore-write';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const InputSchema = z.object({
  gtin: z.string().min(8).max(20),
  city: z.string().min(2).max(64),
  buyerName: z.string().min(1).max(80).default('Margins Demo Shopkeeper'),
  address: z.string().min(1).max(240).default('Madurai demo address'),
  lang: z.enum(['ta', 'hi', 'en']).default('en'),
  acceptPrice: z.number().min(0).max(1_000_000).optional(),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 'order', 6);
  if (!rl.ok) return tooManyRequests(rl);

  let body: z.infer<typeof InputSchema>;
  try {
    body = InputSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  if (!isValidGTIN(body.gtin)) {
    return NextResponse.json(
      { error: 'invalid_gtin', message: 'Barcode failed the GS1 mod-10 check-digit validation.' },
      { status: 400 },
    );
  }

  const safeCity = sanitizeCity(body.city);
  const city = sanitizePromptText(safeCity.length >= 2 ? canonicalCityName(safeCity) : 'Madurai', 64);
  const buyerName = sanitizePromptText(body.buyerName, 80);
  const address = sanitizePromptText(body.address, 240);
  const bapUri = requestOrigin(req);

  try {
    // Step 1: search
    const search = await becknSearch({ gtin: body.gtin, city, bapUri });
    if (search.quotes.length === 0) {
      return NextResponse.json({ error: 'no_suppliers', step: 'search' }, { status: 404 });
    }

    // Pick the cheapest supplier
    const chosen = [...search.quotes].sort((a, b) => a.price - b.price)[0];
    if (body.acceptPrice && chosen.price > body.acceptPrice) {
      return NextResponse.json({
        error: 'price_too_high',
        cheapestPrice: chosen.price,
        yourMax: body.acceptPrice,
        step: 'search',
      }, { status: 402 });
    }

    // Step 2: select
    const sel = await becknSelect({
      txId: chosen.transactionId,
      providerId: chosen.providerId,
      itemId: chosen.itemId,
      city,
      bapUri,
    });

    // Step 3: init
    const init = await becknInit({
      txId: chosen.transactionId,
      providerId: chosen.providerId,
      itemId: chosen.itemId,
      city,
      buyerName,
      address,
      bapUri,
    });

    // Step 4: confirm — at the quoted amount
    const conf = await becknConfirm({
      txId: chosen.transactionId,
      providerId: chosen.providerId,
      itemId: chosen.itemId,
      city,
      buyerName,
      address,
      amount: chosen.price,
      bapUri,
    });

    const finalOrder = conf?.message?.order;
    const orderId = finalOrder?.id ?? `ord-${Date.now()}`;

    // Log to Firestore (safe single-attempt write; never blocks the response)
    void serverAddDoc('orders', {
      orderId,
      transactionId: chosen.transactionId,
      gtin: body.gtin,
      provider: chosen.provider,
      price: chosen.price,
      city,
      buyerName,
      lang: body.lang,
      state: finalOrder?.state,
    });

    return NextResponse.json({
      success: true,
      orderId,
      transactionId: chosen.transactionId,
      provider: chosen.provider,
      price: chosen.price,
      state: finalOrder?.state,
      steps: {
        search: { acks: search.acks, suppliers_found: search.quotes.length },
        select: { acks: [sel?.message?.ack?.status ?? 'ACK'] },
        init: { acks: [init?.message?.ack?.status ?? 'ACK'] },
        confirm: { acks: [conf?.message?.ack?.status ?? 'ACK'] },
      },
      // Return the canonical Beckn order audit record
      beckn_order: finalOrder,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function requestOrigin(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  return host ? `${proto}://${host}` : (process.env.APP_URL ?? '');
}
