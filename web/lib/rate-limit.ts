/**
 * lib/rate-limit.ts — in-memory sliding-window rate limiter
 *
 * Protects the Gemini-backed (quota-metered) and Firestore-backed endpoints
 * from anonymous abuse. Free AI tiers die at 1,500 requests/day; without this
 * a single loop kills the oracle for everyone.
 *
 * Scope note (documented honestly): on serverless, this limiter is per
 * compute instance. Vercel warm functions each hold their own window, so the
 * effective global limit is `limit × warm instances` — still a 10-100x
 * improvement over unbounded. For a hard global cap, front the deployment
 * with Vercel WAF rate rules or swap the store for Upstash Redis (the
 * interface below is store-agnostic).
 */

import { NextRequest, NextResponse } from 'next/server';

type Window = { hits: number[] };

const buckets = new Map<string, Window>();

/** Opportunistic GC so the map cannot grow unbounded. */
let lastGc = 0;
function gc(now: number, windowMs: number) {
  if (now - lastGc < 60_000) return;
  lastGc = now;
  for (const [k, w] of buckets) {
    if (!w.hits.length || now - w.hits[w.hits.length - 1] > windowMs * 4) buckets.delete(k);
  }
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? (req as unknown as { ip?: string }).ip ?? 'unknown';
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Sliding-window counter. `limit` requests per `windowMs` per key.
 */
export function rateLimit(req: NextRequest, bucket: string, limit: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  gc(now, windowMs);

  const key = `${bucket}:${clientIp(req)}`;
  const w = buckets.get(key) ?? { hits: [] };
  w.hits = w.hits.filter((t) => now - t < windowMs);

  if (w.hits.length >= limit) {
    const retryAfterMs = w.hits[0] + windowMs - now;
    buckets.set(key, w); // keep pruned hits for accurate retry math
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  w.hits.push(now);
  buckets.set(key, w);
  return { ok: true, remaining: limit - w.hits.length, retryAfterSeconds: 0 };
}

/** Standard 429 response with Retry-After. */
export function tooManyRequests(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'rate_limited',
      message: 'Too many requests. Free-tier AI quotas are shared — please retry shortly.',
      retryAfterSeconds: result.retryAfterSeconds,
    },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } },
  );
}
