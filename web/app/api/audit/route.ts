/**
 * /api/audit
 *
 * GET → returns recent fair-price calls with full source provenance.
 * Uses the regular firebase client SDK (no service account needed in dev).
 * In production, swap to firebase-admin for server-only access.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const q = query(collection(db, 'audit'), orderBy('timestamp', 'desc'), limit(20));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ count: rows.length, rows });
  } catch (e) {
    return NextResponse.json({
      count: 0,
      rows: [],
      note: 'Firestore unreachable from server route — view audit data at the Firebase console',
      error: String(e),
    });
  }
}