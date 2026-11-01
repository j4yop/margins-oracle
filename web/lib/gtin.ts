/**
 * lib/gtin.ts — GS1 GTIN validation & normalization
 *
 * Implements the GS1 mod-10 check digit algorithm for every GTIN carrier:
 *   GTIN-8  (EAN-8),  GTIN-12 (UPC-A),  GTIN-13 (EAN-13),  GTIN-14 (ITF-14 carton codes)
 *
 * ITF-14 master-carton codes carry a leading logistics indicator digit; we
 * validate the full 14-digit number and expose the embedded GTIN-13 so a
 * truck-side carton scan resolves to the consumer product underneath
 * (the #1 field complaint from the design council).
 */

const GTIN_LENGTHS = [8, 12, 13, 14] as const;

/** GS1 standard check-digit: weighted sum (×3 on odd positions from the right for GTIN-13). */
export function gs1CheckDigit(digitsWithoutCheck: string): number | null {
  if (!/^\d+$/.test(digitsWithoutCheck)) return null;
  const digits = digitsWithoutCheck.split('').reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

export type GTINFormat = 'GTIN-8' | 'GTIN-12' | 'GTIN-13' | 'GTIN-14';

export type GTINParseResult = {
  valid: boolean;
  reason?: string;
  format?: GTINFormat;
  /** Canonical 13-digit identity (for GTIN-14, the embedded consumer GTIN-13). */
  gtin13?: string;
};

export function parseGTIN(raw: string): GTINParseResult {
  const clean = (raw ?? '').replace(/[\s-]/g, '');
  if (!clean) return { valid: false, reason: 'empty' };
  if (!/^\d+$/.test(clean)) return { valid: false, reason: 'non_numeric' };
  if (!GTIN_LENGTHS.includes(clean.length as (typeof GTIN_LENGTHS)[number])) {
    return { valid: false, reason: 'bad_length' };
  }
  const body = clean.slice(0, -1);
  const expected = gs1CheckDigit(body);
  if (expected === null) return { valid: false, reason: 'malformed' };
  if (expected !== Number(clean.slice(-1))) {
    return { valid: false, reason: 'checksum_failed' };
  }
  const format = (`GTIN-${clean.length}` as GTINFormat);
  const gtin13 = clean.length === 14 ? clean.slice(1) : clean.padStart(13, '0');
  return { valid: true, format, gtin13 };
}

/** Quick boolean gate for API validation. */
export function isValidGTIN(raw: string): boolean {
  return parseGTIN(raw).valid;
}

/**
 * Normalize any valid GTIN carrier to its canonical 13-digit form.
 * Returns null when invalid — callers decide whether to reject (APIs) or
 * degrade (UI).
 */
export function normalizeToGTIN13(raw: string): string | null {
  const r = parseGTIN(raw);
  return r.valid ? r.gtin13! : null;
}
