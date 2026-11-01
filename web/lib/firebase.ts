/**
 * web/lib/firebase.ts
 *
 * Browser-side Firebase SDK init. Reads config from NEXT_PUBLIC_* env vars.
 * Reads + writes to Firestore from the mobile PWA surface.
 *
 * Security model (post-audit):
 *  - Every ledger write is attributed to an *authenticated* user. We use
 *    Firebase Anonymous Auth (ensureAuth) so real security rules
 *    (`request.auth != null` + ownerUid match) are enforceable without
 *    onboarding friction. Enable the "Anonymous" provider in the Firebase
 *    console (Authentication → Sign-in method).
 *  - firebaseConfigured() lets server routes skip writes entirely instead of
 *    storming gRPC retries with an invalid `projects/undefined/...` path.
 */

import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const cfg: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps()[0] ?? initializeApp(cfg);
export const db: Firestore = getFirestore(app);

/** True only when the minimum viable config is present. */
export function firebaseConfigured(): boolean {
  return Boolean(cfg.apiKey && cfg.projectId);
}

/**
 * Sign the browser in anonymously (Firebase Anonymous Auth). Returns the uid
 * for owner-scoped ledger writes, or null when the provider is disabled /
 * config missing — callers must degrade gracefully.
 */
export async function ensureAuth(): Promise<string | null> {
  try {
    const { getAuth, signInAnonymously } = await import('firebase/auth');
    const auth = getAuth(app);
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser?.uid ?? null;
  } catch (e) {
    console.warn(
      '[margins/firebase] anonymous auth unavailable — enable the Anonymous provider ' +
      'in the Firebase console to persist ledger data:',
      String(e).slice(0, 140),
    );
    return null;
  }
}

export type LedgerTx = {
  merchantId: string;
  gtin: string;
  product: string;
  supplierPrice: number;
  fairPrice: number;
  saved: number;
  verdict: 'fair' | 'overpriced' | 'underpriced' | 'insufficient_data';
  sources?: { name: string; price: number; url?: string }[];
  ownerUid?: string | null;
};

/** margins-ledger: log a transaction to Firestore (owner-attributed). */
export async function logTransaction(tx: LedgerTx) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  await addDoc(collection(db, 'transactions'), {
    ...tx,
    timestamp: serverTimestamp(),
  });
}

/**
 * margins-ledger: query the caller's history.
 * When `ownerUid` is provided (post-auth), rows are scoped to that identity —
 * matching the hardened rules. Without it, the legacy merchantId filter is
 * used and will simply return no rows under the new rules.
 */
export async function recentTransactions(merchantId: string, limit = 20, ownerUid?: string | null) {
  const { collection, query, where, orderBy, limit: qLimit, getDocs } = await import('firebase/firestore');
  const base = collection(db, 'transactions');
  const q = ownerUid
    ? query(base, where('ownerUid', '==', ownerUid), orderBy('timestamp', 'desc'), qLimit(limit))
    : query(base, where('merchantId', '==', merchantId), orderBy('timestamp', 'desc'), qLimit(limit));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
