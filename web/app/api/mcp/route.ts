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
 * Security (post-audit):
 *  - Optional bearer auth: set MCP_ACCESS_TOKEN and tools/call requires
 *    `Authorization: Bearer <token>` (tools/list + initialize stay open for
 *    discovery). Unset = open with per-IP rate limits.
 *  - GTIN checksum validation inside tools; per-IP rate limit per method.
 *
 * Reference: https://modelcontextprotocol.io/
 */

import { NextRequest, NextResponse } from 'next/server';
import { proModel, flashModel, getModel, computeHeuristicFairPrice, FAIR_PRICE_SCHEMA, MODELS } from '@/lib/gemini';
import { lookupGTIN } from '@/lib/gs1';
import { agmarknetPrice } from '@/lib/agmarknet';
import { becknSearch, becknSelect, becknInit, becknConfirm } from '@/lib/beckn';
import { isValidGTIN } from '@/lib/gtin';
import { sanitizeCity, sanitizePromptText, PROMPT_GUARD } from '@/lib/prompt-guard';
import { canonicalCityName } from '@/lib/cities';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { adminQueryTransactions } from '@/lib/firestore-write';
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

function authorized(req: NextRequest): boolean {
  const token = process.env.MCP_ACCESS_TOKEN;
  if (!token) return true; // open mode (rate-limited)
  return (req.headers.get('authorization') ?? '') === `Bearer ${token}`;
}

function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, 'parse error');
  }

  const { jsonrpc = '2.0', method, params, id } = body ?? {};

  if (method === 'tools/list') {
    const rl = rateLimit(req, 'mcp-list', 60);
    if (!rl.ok) return tooManyRequests(rl);
    return NextResponse.json({ jsonrpc, id, result: { tools: TOOLS } });
  }

  if (method === 'tools/call') {
    if (!authorized(req)) {
      return rpcError(id, -32001, 'unauthorized: set MCP_ACCESS_TOKEN and send Authorization: Bearer');
    }
    const rl = rateLimit(req, 'mcp-call', 30);
    if (!rl.ok) return tooManyRequests(rl);

    const toolName = params?.name;
    const args = params?.arguments ?? {};
    try {
      let result: any;
      if (toolName === 'fair_price_band') {
        result = await fairPriceBand(args, req);
      } else if (toolName === 'place_beckn_order') {
        result = await placeOrder(args, req);
      } else if (toolName === 'query_margins_ledger') {
        result = await queryLedger(args);
      } else {
        return rpcError(id, -32602, `unknown tool: ${toolName}`);
      }
      return NextResponse.json({
        jsonrpc,
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
      });
    } catch (e) {
      if (e instanceof McpInputError) {
        return rpcError(id, -32602, e.message);
      }
      if (e instanceof ZodError) {
        return rpcError(id, -32602, 'invalid tool arguments');
      }
      return rpcError(id, -32000, String(e).slice(0, 300));
    }
  }

  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc,
      id,
      result: {
        protocolVersion: '2025-06-18',
        serverInfo: { name: 'margins-mcp', version: '0.2.0' },
        capabilities: { tools: {} },
      },
    });
  }

  return rpcError(id, -32601, `unknown method: ${method}`);
}

export async function GET() {
  return NextResponse.json({
    name: 'margins-mcp',
    version: '0.2.0',
    description: 'Fairness oracle for Indian commerce. Exposes fair_price_band, place_beckn_order, query_margins_ledger as MCP tools.',
    transport: 'http',
    endpoint: '/api/mcp',
    authentication: process.env.MCP_ACCESS_TOKEN ? 'bearer (MCP_ACCESS_TOKEN configured)' : 'open (rate-limited)',
    tools: TOOLS,
  });
}

class McpInputError extends Error {}

async function fairPriceBand(args: { gtin: string; city: string; quantity?: number }, req: NextRequest) {
  const schema = z.object({ gtin: z.string().min(8).max(20), city: z.string().min(2).max(64), quantity: z.number().int().min(1).max(1000).default(1) });
  const body = schema.parse(args);
  if (!isValidGTIN(body.gtin)) {
    throw new McpInputError('invalid gtin: failed GS1 mod-10 check-digit validation');
  }
  const safeCity = sanitizeCity(body.city);
  const city = safeCity.length >= 2 ? canonicalCityName(safeCity) : 'India';

  const product = await lookupGTIN(body.gtin);
  const [mandiPx, becknRes] = await Promise.allSettled([
    agmarknetPrice({ gtin: body.gtin, city }),
    becknSearch({ gtin: body.gtin, city, quantity: body.quantity, bapUri: requestOrigin(req) }),
  ]);
  const mandi = mandiPx.status === 'fulfilled' ? mandiPx.value : null;
  const becknQuotes = becknRes.status === 'fulfilled' ? becknRes.value.quotes : [];
  const sources = [
    ...(product.mrp ? [{ name: 'GS1 India (MRP)', price: product.mrp, url: product.gs1Url }] : []),
    mandi
      ? {
          name: mandi.source === 'agmarknet-datagov' ? 'Agmarknet via data.gov.in (mandi)' : 'Wholesale model estimate (MRP × factor)',
          price: mandi.price,
          url: mandi.url,
        }
      : null,
    ...becknQuotes.map((q) => ({ name: `ONDC Beckn — ${q.provider}`, price: q.price, url: q.url })),
  ].filter(Boolean) as { name: string; price: number; url: string }[];

  const prompt = `You are MARGINS — a fairness oracle.
${PROMPT_GUARD}
Compute a fair-price band (low, median, high) for ${sanitizePromptText(product.name, 120)} in ${sanitizePromptText(city, 64)} using these sources:
${JSON.stringify(sources, null, 2)}

Return JSON conforming to: {product, fairPriceBand:{low,median,high,currency:'INR'}, verdict:'fair'|'overpriced'|'underpriced'|'insufficient_data', confidence:0..1, sources:[{name,price,url,timestamp}], reasoning, hagglingGuidance:{openingOffer,walkAway,scriptHint}}.`;

  let text: string | null = null;
  const candidateModels = [proModel(), flashModel(), getModel('gemini-2.5-flash'), getModel('gemini-2.0-flash')];

  for (const m of candidateModels) {
    try {
      const out = await m.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: FAIR_PRICE_SCHEMA },
      });
      text = out.response.text();
      if (text) break;
    } catch {
      // try next model
    }
  }

  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      // fallback to heuristic
    }
  }

  return computeHeuristicFairPrice({ product, sources, city, quantity: body.quantity });
}

async function placeOrder(args: { gtin: string; city: string; buyerName?: string; acceptPrice?: number }, req: NextRequest) {
  const schema = z.object({
    gtin: z.string().min(8).max(20),
    city: z.string().min(2).max(64),
    buyerName: z.string().min(1).max(80).optional(),
    acceptPrice: z.number().min(0).max(1_000_000).optional(),
  });
  const a = schema.parse(args);
  if (!isValidGTIN(a.gtin)) {
    throw new McpInputError('invalid gtin: failed GS1 mod-10 check-digit validation');
  }
  const safeCity = sanitizeCity(a.city);
  const city = safeCity.length >= 2 ? canonicalCityName(safeCity) : 'Madurai';
  const buyerName = sanitizePromptText(a.buyerName ?? 'MARGINS caller', 80);
  const bapUri = requestOrigin(req);

  const search = await becknSearch({ gtin: a.gtin, city, bapUri });
  if (search.quotes.length === 0) throw new Error('no suppliers');
  const chosen = [...search.quotes].sort((x, y) => x.price - y.price)[0];
  if (a.acceptPrice && chosen.price > a.acceptPrice) {
    return { error: 'price_too_high', cheapest: chosen.price, yourMax: a.acceptPrice };
  }
  const txId = chosen.transactionId;
  await becknSelect({ txId, providerId: chosen.providerId, itemId: chosen.itemId, city, bapUri });
  await becknInit({ txId, providerId: chosen.providerId, itemId: chosen.itemId, city, buyerName, address: 'MARGINS MCP caller address', bapUri });
  const conf = await becknConfirm({ txId, providerId: chosen.providerId, itemId: chosen.itemId, city, buyerName, address: 'MARGINS MCP caller address', amount: chosen.price, bapUri });
  return { orderId: conf?.message?.order?.id, provider: chosen.provider, price: chosen.price, state: conf?.message?.order?.state };
}

async function queryLedger(args: { merchantId: string; limit?: number }) {
  const schema = z.object({ merchantId: z.string().min(1).max(80), limit: z.number().int().min(1).max(50).default(10) });
  const a = schema.parse(args);
  const merchantId = sanitizePromptText(a.merchantId, 80);

  const adminRows = await adminQueryTransactions(merchantId, a.limit);
  if (adminRows) return adminRows;

  return {
    error: 'ledger_unavailable',
    note: 'Server-side ledger reads require FIREBASE_SERVICE_ACCOUNT_KEY (Admin SDK). Anonymous client reads are blocked by the hardened Firestore rules by design.',
    merchantId,
  };
}

function requestOrigin(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  return host ? `${proto}://${host}` : (process.env.APP_URL ?? '');
}
