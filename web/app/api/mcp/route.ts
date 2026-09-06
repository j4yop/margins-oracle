/**
 * /api/mcp — the margins-mcp server endpoint
 *
 * Implements the Model Context Protocol over HTTP. Any other AI agent
 * (Claude, Gemini, GPT, custom) can call this and get a fair-price band
 * for any Indian product.
 *
 * MCP over HTTP is a JSON-RPC 2.0 shape:
 *   POST /api/mcp
 *   {
 *     "jsonrpc": "2.0",
 *     "method": "tools/call",
 *     "params": { "name": "fair_price_band", "arguments": {...} },
 *     "id": 1
 *   }
 *
 * We also serve /.well-known/mcp.json for discovery.
 *
 * Reference: https://modelcontextprotocol.io/
 */

import { NextRequest, NextResponse } from 'next/server';
import { proModel, FAIR_PRICE_SCHEMA, MODELS } from '@/lib/gemini';
import { lookupGTIN } from '@/lib/gs1';
import { agmarknetPrice } from '@/lib/agmarknet';
import { becknSearch } from '@/lib/beckn';
import { ZodError, z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FAIR_PRICE_TOOL = {
  name: 'fair_price_band',
  description: 'Compute a fair-price band for an Indian product by GTIN, city, and quantity. Backed by GS1 India MRP, Agmarknet mandi prices, ONDC Beckn live quotes, and Gemini reasoning.',
  inputSchema: {
    type: 'object',
    properties: {
      gtin: { type: 'string', description: 'Global Trade Item Number (barcode), e.g. 8901058851649' },
      city: { type: 'string', description: 'Indian city, e.g. Madurai, Bengaluru, Mumbai, Delhi' },
      quantity: { type: 'number', description: 'Number of units', default: 1 },
    },
    required: ['gtin', 'city'],
  },
};

const PLACE_ORDER_TOOL = {
  name: 'place_beckn_order',
  description: 'Place an order through the ONDC Beckn network for a given GTIN at a fair price.',
  inputSchema: {
    type: 'object',
    properties: {
      gtin: { type: 'string' },
      city: { type: 'string' },
      buyerName: { type: 'string', default: 'MARGINS caller' },
      acceptPrice: { type: 'number' },
    },
    required: ['gtin', 'city'],
  },
};

const QUERY_LEDGER_TOOL = {
  name: 'query_margins_ledger',
  description: 'Query a merchant\'s margins ledger for past transactions.',
  inputSchema: {
    type: 'object',
    properties: {
      merchantId: { type: 'string' },
      limit: { type: 'number', default: 10 },
    },
    required: ['merchantId'],
  },
};

const TOOLS = [FAIR_PRICE_TOOL, PLACE_ORDER_TOOL, QUERY_LEDGER_TOOL];

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32700, message: 'parse error' }, id: null });
  }

  const { jsonrpc = '2.0', method, params, id } = body ?? {};

  if (method === 'tools/list') {
    return NextResponse.json({ jsonrpc, id, result: { tools: TOOLS } });
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments ?? {};
    try {
      let result: any;
      if (toolName === 'fair_price_band') {
        result = await fairPriceBand(args);
      } else if (toolName === 'place_beckn_order') {
        result = await placeOrder(args);
      } else if (toolName === 'query_margins_ledger') {
        result = await queryLedger(args);
      } else {
        return NextResponse.json({ jsonrpc, id, error: { code: -32602, message: `unknown tool: ${toolName}` } });
      }
      return NextResponse.json({
        jsonrpc,
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
      });
    } catch (e) {
      return NextResponse.json({ jsonrpc, id, error: { code: -32000, message: String(e) } });
    }
  }

  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc,
      id,
      result: {
        protocolVersion: '2025-06-18',
        serverInfo: { name: 'margins-mcp', version: '0.1.0' },
        capabilities: { tools: {} },
      },
    });
  }

  return NextResponse.json({ jsonrpc, id, error: { code: -32601, message: `unknown method: ${method}` } });
}

export async function GET() {
  return NextResponse.json({
    name: 'margins-mcp',
    version: '0.1.0',
    description: 'Fairness oracle for Indian commerce. Exposes fair_price_band, place_beckn_order, query_margins_ledger as MCP tools.',
    transport: 'http',
    endpoint: '/api/mcp',
    tools: TOOLS,
  });
}

async function fairPriceBand(args: { gtin: string; city: string; quantity?: number }) {
  const schema = z.object({ gtin: z.string().min(8), city: z.string(), quantity: z.number().default(1) });
  const body = schema.parse(args);
  const product = await lookupGTIN(body.gtin);
  const [mandiPx, becknRes] = await Promise.allSettled([
    agmarknetPrice({ gtin: body.gtin, city: body.city }),
    becknSearch({ gtin: body.gtin, city: body.city, quantity: body.quantity }),
  ]);
  const becknQuotes = becknRes.status === 'fulfilled' ? becknRes.value.quotes : [];
  const sources = [
    ...(product.mrp ? [{ name: 'GS1 India (MRP)', price: product.mrp, url: product.gs1Url }] : []),
    mandiPx.status === 'fulfilled' && mandiPx.value ? { name: 'Agmarknet (mandi)', price: mandiPx.value.price, url: mandiPx.value.url } : null,
    ...becknQuotes.map((q) => ({ name: `ONDC Beckn — ${q.provider}`, price: q.price, url: q.url })),
  ].filter(Boolean) as { name: string; price: number; url: string }[];

  const prompt = `You are MARGINS — a fairness oracle. Compute a fair-price band (low, median, high) for ${product.name} in ${body.city} using these sources:\n${JSON.stringify(sources, null, 2)}\n\nReturn JSON conforming to: {product, fairPriceBand:{low,median,high,currency:'INR'}, verdict:'fair'|'overpriced'|'underpriced'|'insufficient_data', confidence:0..1, sources:[{name,price,url,timestamp}], reasoning, hagglingGuidance:{openingOffer,walkAway,scriptHint}}.`;
  let text: string;
  try {
    const out = await proModel().generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: FAIR_PRICE_SCHEMA },
    });
    text = out.response.text();
  } catch {
    // fall back to flash
    const { flashModel } = await import('@/lib/gemini');
    const out = await flashModel().generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: FAIR_PRICE_SCHEMA },
    });
    text = out.response.text();
  }
  return JSON.parse(text);
}

async function placeOrder(args: { gtin: string; city: string; buyerName?: string; acceptPrice?: number }) {
  const { becknSearch: bs, becknSelect, becknInit, becknConfirm } = await import('@/lib/beckn');
  const search = await bs({ gtin: args.gtin, city: args.city });
  if (search.quotes.length === 0) throw new Error('no suppliers');
  const chosen = [...search.quotes].sort((a, b) => a.price - b.price)[0];
  if (args.acceptPrice && chosen.price > args.acceptPrice) {
    return { error: 'price_too_high', cheapest: chosen.price, yourMax: args.acceptPrice };
  }
  const txId = chosen.transactionId;
  await becknSelect({ txId, providerId: chosen.providerId, itemId: chosen.itemId, city: args.city });
  await becknInit({ txId, providerId: chosen.providerId, itemId: chosen.itemId, city: args.city, buyerName: args.buyerName ?? 'MARGINS caller', address: 'MARGINS MCP caller address' });
  const conf = await becknConfirm({ txId, providerId: chosen.providerId, itemId: chosen.itemId, city: args.city, buyerName: args.buyerName ?? 'MARGINS caller', address: 'MARGINS MCP caller address' });
  return { orderId: conf?.message?.order?.id, provider: chosen.provider, price: chosen.price, state: conf?.message?.order?.state };
}

async function queryLedger(args: { merchantId: string; limit?: number }) {
  try {
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs, query, where, orderBy, limit: qLimit } = await import('firebase/firestore');
    const q = query(
      collection(db, 'transactions'),
      where('merchantId', '==', args.merchantId),
      orderBy('timestamp', 'desc'),
      qLimit(args.limit ?? 10),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (e) {
    return { error: String(e), note: 'Firestore unreachable' };
  }
}