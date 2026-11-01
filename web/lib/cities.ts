/**
 * lib/cities.ts — Indian city ↔ ONDC/Beckn STD city codes
 *
 * The Beckn context requires `city.code` in `std:<number>` form (e.g. std:080
 * for Bengaluru). The original codebase passed raw city *names* ("Bengaluru")
 * into `context.city`, which meant city-aware supplier routing silently never
 * activated (verified live: Bengaluru requests were served the Madurai
 * supplier set). This module is the single source of truth for the mapping.
 *
 * Note: the original repo invented non-existent STD codes (e.g. std:0625 for
 * Madurai). These are the real DoT STD codes.
 */

export type CityEntry = { name: string; code: string; aliases: string[] };

export const CITIES: CityEntry[] = [
  { name: 'Madurai', code: 'std:0452', aliases: ['madurai'] },
  { name: 'Bengaluru', code: 'std:080', aliases: ['bengaluru', 'bangalore', 'bengluru'] },
  { name: 'Mumbai', code: 'std:022', aliases: ['mumbai', 'bombay'] },
  { name: 'Delhi', code: 'std:011', aliases: ['delhi', 'new delhi'] },
  { name: 'Kolkata', code: 'std:033', aliases: ['kolkata', 'calcutta'] },
  { name: 'Chennai', code: 'std:044', aliases: ['chennai', 'madras'] },
  { name: 'Hyderabad', code: 'std:040', aliases: ['hyderabad'] },
  { name: 'Pune', code: 'std:020', aliases: ['pune', 'poona'] },
  { name: 'Ahmedabad', code: 'std:079', aliases: ['ahmedabad'] },
  { name: 'Jaipur', code: 'std:0141', aliases: ['jaipur'] },
  { name: 'Coimbatore', code: 'std:0422', aliases: ['coimbatore'] },
  { name: 'Trichy', code: 'std:0431', aliases: ['trichy', 'tiruchirappalli'] },
];

/** Normalize any user input (name, alias, or existing std code) to a city code. */
export function toCityCode(input: string): string | null {
  const s = (input ?? '').trim().toLowerCase();
  if (!s) return null;
  if (/^std:\d+$/.test(s)) return s;
  const digits = s.replace(/\D/g, '');
  const byName = CITIES.find((c) => c.aliases.includes(s));
  if (byName) return byName.code;
  if (digits.length >= 2 && digits.length <= 5) {
    const byCode = CITIES.find((c) => c.code === `std:${digits}`);
    if (byCode) return byCode.code;
  }
  return null;
}

/** Human display name for a code (falls back to the code itself). */
export function cityNameFromCode(code: string): string {
  const c = CITIES.find((x) => x.code === (code ?? '').toLowerCase());
  return c?.name ?? code;
}

/** Display name for arbitrary input — returns the canonical city name. */
export function canonicalCityName(input: string): string {
  const code = toCityCode(input);
  return code ? cityNameFromCode(code) : (input ?? '').trim();
}
