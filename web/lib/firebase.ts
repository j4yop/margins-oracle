/**
 * web/lib/firebase.ts
 *
 * Browser-side Firebase SDK init. Reads config from NEXT_PUBLIC_* env vars.
 * Reads + writes to Firestore from the iPhone demo surface.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps()[0] ?? initializeApp(cfg);
export const db = getFirestore(app);

/**
 * margins-ledger: log a transaction to Firestore.
 * Open rules in dev — every shopkeeper's transactions land here.
 */
export async function logTransaction(tx: {
  merchantId: string;
  gtin: string;
  product: string;
  supplierPrice: number;
  fairPrice: number;
  saved: number;
  verdict: 'fair' | 'overpriced' | 'underpriced' | 'insufficient_data';
  sources: { name: string; price: number; url?: string }[];
}) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  await addDoc(collection(db, 'transactions'), {
    ...tx,
    timestamp: serverTimestamp(),
  });
}

/**
 * margins-ledger: query a merchant's history. Powers the "what did I sell Tuesday?" voice query.
 */
export async function recentTransactions(merchantId: string, limit = 20) {
  const { collection, query, where, orderBy, limit: qLimit, getDocs } = await import('firebase/firestore');
  const q = query(
    collection(db, 'transactions'),
    where('merchantId', '==', merchantId),
    orderBy('timestamp', 'desc'),
    qLimit(limit),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}