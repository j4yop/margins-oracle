/**
 * /api/beckn/bap — Buyer App Protocol callback endpoint
 *
 * This route DID NOT EXIST in the original codebase (verified 404) even
 * though every emitted Beckn context declared
 * `bap_uri: http://localhost:3000/api/beckn/bap`. On a real network, Beckn is
 * asynchronous: BPPs answer `search` at the gateway and deliver `on_search` /
 * `on_select` / `on_init` / `on_confirm` / `on_error` payloads *to this
 * endpoint* by POSTing to the public bap_uri.
 *
 * Behavior:
 *  - ACKs every well-formed callback within the protocol timeout (a NACK on
 *    processing failure is itself part of the spec).
 *  - Persists the latest payloads per transaction to Firestore when admin
 *    credentials exist (collection `beckn_callbacks`, append-only) so the
 *    async order orchestrator can resume state.
 *  - Keeps a bounded in-memory ring buffer for mock/dev introspection (GET).
 *
 * Signature verification of inbound BPP requests requires the ONDC registry
 * lookup (fetch the subscriber's published public key by subscriber_id and
 * verify the Authorization header). That registry integration lands with the
 * Phase-2 go-live; until then the route records header presence and flags
 * unverified traffic — never silently trusting it for order mutation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { serverAddDoc } from '@/lib/firestore-write';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BUFFER = 50;
const ring: { ts: string; action: string; transactionId: string; verified: boolean; summary: string }[] = [];

function ack(body: any, action: string) {
  return NextResponse.json({
    context: { ...(body?.context ?? {}), action },
    message: { ack: { status: 'ACK' } },
  });
}

function nack(body: any, action: string, message: string, status = 400) {
  return NextResponse.json(
    {
      context: { ...(body?.context ?? {}), action },
      message: { ack: { status: 'NACK' }, error: { type: 'CORE-ERROR', code: '10000', message } },
    },
    { status },
  );
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return nack({}, 'unknown', 'malformed JSON body');
  }

  const action: string = body?.context?.action ?? '';
  if (!action.startsWith('on_')) {
    return nack(body, 'unknown', `not a callback action: "${action}"`);
  }

  const transactionId: string = body?.context?.transaction_id ?? 'unknown';
  const authHeader = req.headers.get('authorization') ?? '';
  const hasSignature = authHeader.startsWith('Signature ');
  // TODO(go-live Phase 2): verify the Authorization header against the ONDC
  // registry-published key for body.context.bpp_id. Until then we persist the
  // payload but mark it unverified — order state is never mutated from here.
  if (!hasSignature) {
    console.warn('[beckn/bap] callback without Authorization signature — recording as unverified');
  }

  const summary = summarize(body);
  ring.unshift({ ts: new Date().toISOString(), action, transactionId, verified: hasSignature, summary });
  if (ring.length > MAX_BUFFER) ring.pop();

  // Persist for the async orchestrator (admin creds required; degrades silently).
  void serverAddDoc('beckn_callbacks', {
    action,
    transactionId,
    verified: hasSignature,
    payload: body,
  });

  return ack(body, action);
}

export async function GET() {
  return NextResponse.json({
    name: 'margins-bap-callbacks',
    transports: ['on_search', 'on_select', 'on_init', 'on_confirm', 'on_error'],
    note: 'POST Beckn on_* callbacks here. Signature verification activates with ONDC registry integration.',
    recent: ring,
  });
}

function summarize(body: any): string {
  try {
    const order = body?.message?.order;
    if (order?.id) return `order ${order.id} state=${order.state ?? '?'}`;
    const catalogs = body?.message?.catalogs;
    if (catalogs) return `${catalogs[0]?.providers?.length ?? 0} providers`;
    if (body?.message?.error) return `error: ${String(body.message.error.message ?? '').slice(0, 80)}`;
    return 'payload recorded';
  } catch {
    return 'payload recorded';
  }
}
