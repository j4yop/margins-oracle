/**
 * /api/audit
 *
 * GET → returns fair-price audit telemetry.
 *
 * Post-audit change (finding #10): raw audit rows exposed query patterns
 * publicly. Now:
 *  - Default: aggregated stats only (counts by verdict/model) — safe to expose.
 *  - Full rows: only with `Authorization: Bearer $ADMIN_TOKEN` when the
 *    server-side ADMIN_TOKEN env is configured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminDb = await getAdminDb();

  if (!adminDb) {
    return NextResponse.json({
      count: 0,
      rows: [],
      stats: null,
      note: 'Audit telemetry requires server-side Firestore credentials (FIREBASE_SERVICE_ACCOUNT_KEY).',
    });
  }

  const wantsRows = Boolean(process.env.ADMIN_TOKEN) &&
    (req.headers.get('authorization') ?? '') === `Bearer ${process.env.ADMIN_TOKEN}`;

  try {
    const snap = await adminDb.collection('audit').orderBy('createdAt', 'desc').limit(50).get();
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const stats = {
      total: rows.length,
      byVerdict: countBy(rows, (r: any) => r.verdict),
      byModel: countBy(rows, (r: any) => r.model),
    };

    if (!wantsRows) {
      return NextResponse.json({ count: rows.length, rows: [], stats, note: 'Set ADMIN_TOKEN and send Authorization: Bearer to fetch raw rows.' });
    }
    return NextResponse.json({ count: rows.length, rows, stats });
  } catch (e) {
    return NextResponse.json({
      count: 0,
      rows: [],
      stats: null,
      note: 'Firestore unreachable from server route — view audit data at the Firebase console',
      error: String(e).slice(0, 160),
    });
  }
}

function countBy(rows: Record<string, unknown>[], key: (r: any) => unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = String(key(r) ?? 'unknown');
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
