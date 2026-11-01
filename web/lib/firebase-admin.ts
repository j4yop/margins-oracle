/**
 * lib/firebase-admin.ts — optional server-side Admin SDK
 *
 * Server routes (order logging, audit trail, MCP ledger queries) previously
 * used the *browser* Firestore SDK inside Node route handlers. Under locked
 * security rules that is both a privilege error and a reliability error:
 * failed writes retried on gRPC streams for 30+ seconds after the response
 * was already sent (verified live in dev-server logs), all silently.
 *
 * This module lazily initializes firebase-admin ONLY when credentials are
 * present, so builds and local dev never require them:
 *   - FIREBASE_SERVICE_ACCOUNT_KEY  → raw JSON or base64-encoded JSON
 *   - GOOGLE_APPLICATION_CREDENTIALS → path to a service-account file
 *     (also picks up Application Default Credentials on Google infra)
 *
 * When neither is configured, callers fall back to the documented degrade
 * path in lib/firestore-write.ts instead of leaking SDK errors.
 */

import type { Firestore } from 'firebase-admin/firestore';

let cached: Firestore | null | undefined;

export async function getAdminDb(): Promise<Firestore | null> {
  if (cached !== undefined) return cached;

  const hasServiceAccount = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
  if (!hasServiceAccount) {
    cached = null;
    return null;
  }

  try {
    const appMod = await import('firebase-admin/app');
    const fsMod = await import('firebase-admin/firestore');

    if (appMod.getApps().length === 0) {
      const svc = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (svc) {
        const json = svc.trim().startsWith('{')
          ? svc
          : Buffer.from(svc, 'base64').toString('utf8');
        appMod.initializeApp({ credential: appMod.cert(JSON.parse(json)) });
      } else {
        // GOOGLE_APPLICATION_CREDENTIALS / ADC
        appMod.initializeApp();
      }
    }
    cached = fsMod.getFirestore();
  } catch (e) {
    console.warn('[margins/firebase-admin] init failed — server writes will degrade:', String(e).slice(0, 160));
    cached = null;
  }
  return cached;
}
