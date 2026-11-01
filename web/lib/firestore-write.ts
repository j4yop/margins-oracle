/**
 * lib/firestore-write.ts — single-attempt server-side writes with honest outcomes
 *
 * Contract (from the security audit):
 *   1. Prefer the Admin SDK (bypasses rules, no auth needed, fail-fast).
 *   2. Else use the browser SDK from the server ONLY when the config is
 *      complete — a partial config produces `projects/undefined/...`
 *      INVALID_ARGUMENT storms (verified live).
 *   3. Never throw into the request path; never retry (the browser SDK's
 *      internal gRPC retry was the log-storm source — we skip entirely when
 *      unconfigured and log exactly once).
 */

import { firebaseConfigured, db } from './firebase';
import { getAdminDb } from './firebase-admin';

export type WriteChannel = 'admin' | 'client' | 'skipped' | 'error';
const logged = new Set<string>();

function logOnce(channel: WriteChannel, collection: string, detail: string) {
  const key = `${channel}:${collection}`;
  if (logged.has(key)) return;
  logged.add(key);
  if (channel === 'skipped') {
    console.warn(
      `[margins/firestore] write to "${collection}" skipped — no Admin credentials and no client config. ` +
      `Set FIREBASE_SERVICE_ACCOUNT_KEY (or NEXT_PUBLIC_FIREBASE_* + enable Anonymous Auth) to persist data.`,
    );
  } else {
    console.warn(`[margins/firestore] write to "${collection}" via ${channel} failed: ${detail}`);
  }
}

export async function serverAddDoc(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<WriteChannel> {
  // 1. Admin path
  const adminDb = await getAdminDb();
  if (adminDb) {
    try {
      await adminDb.collection(collectionName).add({ ...data, createdAt: new Date() });
      return 'admin';
    } catch (e) {
      logOnce('error', collectionName, String(e).slice(0, 160));
      return 'error';
    }
  }

  // 2. Client path — only when fully configured
  if (firebaseConfigured()) {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, collectionName), { ...data, timestamp: serverTimestamp() });
      return 'client';
    } catch (e) {
      logOnce('error', collectionName, String(e).slice(0, 160));
      return 'error';
    }
  }

  // 3. Nothing configured — skip silently-but-visibly, exactly once per collection
  logOnce('skipped', collectionName, '');
  return 'skipped';
}

/** Admin-first read for MCP ledger queries. Returns null when unavailable. */
export async function adminQueryTransactions(
  merchantId: string,
  limit: number,
): Promise<Record<string, unknown>[] | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;
  try {
    const snap = await adminDb
      .collection('transactions')
      .where('merchantId', '==', merchantId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data());
  } catch {
    // Fall back to the timestamp field name used by the client-SDK writer
    try {
      const snap = await adminDb
        .collection('transactions')
        .where('merchantId', '==', merchantId)
        .limit(limit)
        .get();
      return snap.docs.map((d) => d.data());
    } catch (e) {
      console.warn('[margins/firestore] admin ledger query failed:', String(e).slice(0, 160));
      return null;
    }
  }
}
