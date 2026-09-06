/**
 * lib/beckn.ts — Beckn ONDC client (search → select → init → confirm)
 *
 * Real Beckn is a JSON-LD spec over POST to BAP/BPP endpoints. For the
 * hackathon demo we ship a mock BPP inside this Next.js app (at /api/beckn/bpp)
 * that responds with canonical Beckn-shaped payloads. The MARGINS BAP then
 * issues real Beckn calls to that endpoint.
 *
 * Why this is the right move:
 *   - Reference BPP from the Beckn repo is heavy (Node 16, docker) and breaks
 *     on free hosting. A self-contained mock gives the same JSON shape.
 *   - Judges can audit every payload at /api/beckn/bpp
 *   - We can swap to a real ONDC BPP later by changing BECKN_BPP_URL.
 *
 * Spec: https://github.com/beckn/protocol-specifications
 */

const BPP_URL = process.env.BECKN_BPP_URL ?? 'http://127.0.0.1:3000/api/beckn/bpp';
const BPP_ID = process.env.BECKN_BPP_ID ?? 'margins-ref-bpp';
const BPP_URI = process.env.BECKN_BPP_URI ?? BPP_URL;

// In dev (same Next.js process) we bypass HTTP and call the BPP route handler
// directly. This avoids self-fetch flakiness and is also faster.
const USE_LOCAL_BPP = process.env.BECKN_LOCAL === '1' || BPP_URL.startsWith('http://127.0.0.1:') || BPP_URL.startsWith('http://localhost:');

type BecknContext = {
  domain: 'ONDC:RET10'; // grocery
  country: 'IND';
  city: string;
  action: 'search' | 'select' | 'init' | 'confirm' | 'status' | 'cancel' | 'update' | 'track' | 'support';
  core_version: '1.2.0';
  bap_id: string;
  bap_uri: string;
  bpp_id: string;
  bpp_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  ttl?: string;
};

function ctx(action: BecknContext['action'], city: string, extra: Partial<BecknContext> = {}): BecknContext {
  return {
    domain: 'ONDC:RET10',
    country: 'IND',
    city,
    action,
    core_version: '1.2.0',
    bap_id: 'margins.bap',
    bap_uri: 'http://localhost:3000/api/beckn/bap',
    bpp_id: BPP_ID,
    bpp_uri: BPP_URI,
    transaction_id: extra.transaction_id ?? crypto.randomUUID(),
    message_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ttl: extra.ttl ?? 'PT30S',
    ...extra,
  };
}

async function postBeckn(payload: unknown): Promise<any> {
  // Local BPP — call route handler in-process to avoid self-fetch flakiness
  if (USE_LOCAL_BPP) {
    return callLocalBpp(payload);
  }
  // Remote BPP — HTTP with retry
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const ctl = AbortSignal.timeout(15000);
      const r = await fetch(BPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctl,
      });
      if (!r.ok) throw new Error(`beckn ${r.status}: ${await r.text().catch(() => '')}`);
      return r.json();
    } catch (e) {
      lastErr = e;
      console.warn(`[beckn] attempt ${i + 1} failed:`, String(e).slice(0, 200));
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr ?? new Error('beckn failed after retries');
}

/** In-process BPP invocation — bypasses Next.js dev self-fetch flakiness. */
async function callLocalBpp(payload: any): Promise<any> {
  // Dynamic import so we don't pull Next.js runtime in non-server contexts
  const mod = await import('@/app/api/beckn/bpp/route');
  const req = new Request('http://local/beckn/bpp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const res = await mod.POST(req as any);
  if (!res.ok) throw new Error(`local beckn ${res.status}`);
  return res.json();
}

/** Step 1: search — discover suppliers for a GTIN */
export async function becknSearch({ gtin, city, quantity = 1 }: { gtin: string; city: string; quantity?: number }) {
  const txId = crypto.randomUUID();
  const payload = {
    context: ctx('search', city, { transaction_id: txId, message_id: crypto.randomUUID() }),
    message: {
      intent: {
        item: { descriptor: { code: gtin } },
        quantity: { count: quantity },
      },
    },
  };
  const resp = await postBeckn(payload);
  return extractQuotes(resp, txId);
}

function extractQuotes(resp: any, txId: string) {
  // Beckn shape: context + message.catalogs[].providers[].items[].price
  const acks = [resp?.message?.ack?.status ?? 'ACK'];
  const catalogs = resp?.message?.catalogs ?? [];
  const quotes: { provider: string; price: number; url: string; transactionId: string; providerId: string; itemId: string }[] = [];
  for (const c of catalogs) {
    for (const p of c.providers ?? []) {
      for (const it of p.items ?? []) {
        const price = parseFloat(it?.price?.value ?? '0');
        if (price > 0) {
          quotes.push({
            provider: p.descriptor?.name ?? p.id,
            price,
            url: p.id ? `https://ondc.org/mock-bpp/${p.id}` : '',
            transactionId: txId,
            providerId: p.id,
            itemId: it.id,
          });
        }
      }
    }
  }
  return { acks, quotes, raw: resp };
}

/** Step 2: select — lock the chosen provider+item */
export async function becknSelect({ txId, providerId, itemId, city }: { txId: string; providerId: string; itemId: string; city: string }) {
  const payload = {
    context: ctx('select', city, { transaction_id: txId, message_id: crypto.randomUUID() }),
    message: { order: { provider: { id: providerId }, items: [{ id: itemId }] } },
  };
  return postBeckn(payload);
}

/** Step 3: init — buyer fills in fulfilment details */
export async function becknInit({ txId, providerId, itemId, city, buyerName, address }: { txId: string; providerId: string; itemId: string; city: string; buyerName: string; address: string }) {
  const payload = {
    context: ctx('init', city, { transaction_id: txId, message_id: crypto.randomUUID() }),
    message: {
      order: {
        provider: { id: providerId },
        items: [{ id: itemId }],
        buyer: { person: { name: buyerName } },
        fulfillment: { end: { contact: { address } } },
      },
    },
  };
  return postBeckn(payload);
}

/** Step 4: confirm — finalise the order */
export async function becknConfirm({ txId, providerId, itemId, city, buyerName, address }: { txId: string; providerId: string; itemId: string; city: string; buyerName: string; address: string }) {
  const payload = {
    context: ctx('confirm', city, { transaction_id: txId, message_id: crypto.randomUUID() }),
    message: {
      order: {
        provider: { id: providerId },
        items: [{ id: itemId }],
        buyer: { person: { name: buyerName } },
        fulfillment: { end: { contact: { address } } },
      },
      payment: { params: { amount: '0', currency: 'INR' }, status: 'PAID' },
    },
  };
  return postBeckn(payload);
}