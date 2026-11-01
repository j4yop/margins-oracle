/**
 * /api/audit/invoice — Multimodal Delivery Invoice (Parchi) Auditor
 *
 * Accepts a photo/scan of a wholesale paper delivery memo / invoice (parchi).
 * Uses Gemini Multimodal Vision to extract all line items, quantities, quoted
 * rates, and audit them against the wholesale benchmark model. Flags
 * overcharged items in real time before the shopkeeper signs the challan.
 *
 * Security (post-audit):
 *  - image payload capped at ~4 MB decoded (before it reaches Gemini)
 *  - MIME whitelist (jpeg/png/webp/heic) — default 'image/jpeg' honored
 *  - city is sanitized before prompt interpolation + model guard appended
 *  - per-IP rate limit (vision calls are the most expensive in the app)
 */

import { NextRequest, NextResponse } from 'next/server';
import { proModel, flashModel, MODELS } from '@/lib/gemini';
import { sanitizeCity, sanitizePromptText, PROMPT_GUARD } from '@/lib/prompt-guard';
import { canonicalCityName } from '@/lib/cities';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB decoded
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const InputSchema = z.object({
  imageBase64: z.string().max(7_000_000).optional(), // ~4MB decoded + data-url overhead
  mimeType: z.string().default('image/jpeg'),
  city: z.string().min(2).max(64).default('Madurai'),
  useSample: z.boolean().default(false),
});

const SAMPLE_INVOICE_AUDIT = {
  distributor: {
    name: 'TN Wholesale FMCG Distributors Ltd.',
    invoiceNo: 'INV-2026/09/4821',
    date: '2026-09-17',
    city: 'Madurai',
  },
  items: [
    {
      name: 'Amul Salted Butter 500g',
      sku: '8901058851649',
      qty: 24,
      unit: 'pcs',
      rate: 282,
      total: 6768,
      mrp: 280,
      benchmarkFairRate: 252,
      discrepancy: 30,
      verdict: 'overpriced',
      note: 'Billed ₹2 above sticker MRP! Wholesale benchmark is ₹252.',
    },
    {
      name: 'Parle-G Gold Biscuits 1kg',
      sku: '8901030865278',
      qty: 40,
      unit: 'packs',
      rate: 104,
      total: 4160,
      mrp: 110,
      benchmarkFairRate: 95,
      discrepancy: 9,
      verdict: 'overpriced',
      note: 'Rate is 9.4% above wholesale median (₹95).',
    },
    {
      name: 'Tata Salt Crystal 1kg',
      sku: '8901030865728',
      qty: 50,
      unit: 'packs',
      rate: 24,
      total: 1200,
      mrp: 28,
      benchmarkFairRate: 24,
      discrepancy: 0,
      verdict: 'fair',
      note: 'Fair mandi-aligned wholesale rate.',
    },
    {
      name: 'Amul Taaza Toned Milk 1L',
      sku: '8901058851427',
      qty: 30,
      unit: 'cartons',
      rate: 65,
      total: 1950,
      mrp: 70,
      benchmarkFairRate: 64,
      discrepancy: 1,
      verdict: 'fair',
      note: 'Standard dairy distribution margin.',
    },
  ],
  schemes: [
    {
      brand: 'Amul / GCMMF',
      scheme: '12+1 Butter Tub Volume Rebate',
      status: 'unapplied',
      impact: 'Missing 2 free tubs (worth ₹504) for order of 24 units.',
      withheldValue: 504,
    },
  ],
  summary: {
    totalBilled: 14078,
    totalFair: 12998,
    totalOvercharged: 1080,
    totalSchemeWithheld: 504,
    totalRecoverable: 1584,
    flaggedItemsCount: 2,
  },
  whatsAppDisputeNotice:
    '*MARGINS Audit Notice: Delivery Memo #INV-2026/09/4821*\n\nVanakkam Anna,\nAudited today\'s delivery slip at the counter:\n• *Amul Butter 500g*: Billed @ ₹282 (exceeds MRP ₹280!). Fair rate ₹252.\n• *Parle-G Gold 1kg*: Billed @ ₹104 vs fair ₹95.\n• *Unapplied Freebies*: Amul 12+1 scheme not credited (2 tubs missing = ₹504).\n\n*Total Overcharge Claim*: ₹1,584\n*Fair Payable Total*: ₹12,494\n\nPlease issue credit note CN-4821 or adjust on our next delivery. Thank you.',
  actionableAdvice:
    'DO NOT SIGN THE CHALLAN AT CURRENT RATES. Line 1 (Amul Butter) is billed at ₹282 which exceeds consumer MRP (₹280). Demand an immediate ₹1,584 deduction (overcharge + missing freebies) via WhatsApp.',
  analyzed_by: 'sample-grounded-audit',
};

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 'invoice', 6);
  if (!rl.ok) return tooManyRequests(rl);

  let body: z.infer<typeof InputSchema>;
  try {
    body = InputSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // If explicit sample requested or no image provided, return grounded sample audit
  if (body.useSample || !body.imageBase64) {
    return NextResponse.json(SAMPLE_INVOICE_AUDIT);
  }

  // MIME whitelist
  const mimeType = ALLOWED_MIME.has(body.mimeType) ? body.mimeType : null;
  if (!mimeType) {
    return NextResponse.json(
      { error: 'unsupported_media_type', message: `Allowed: ${[...ALLOWED_MIME].join(', ')}` },
      { status: 415 },
    );
  }

  // Strip data URL prefix, then enforce decoded size cap
  const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const decodedBytes = Math.floor((base64Data.length * 3) / 4);
  if (decodedBytes > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: 'image_too_large', message: `Image exceeds ${MAX_IMAGE_BYTES / (1024 * 1024)} MB decoded limit.` },
      { status: 413 },
    );
  }
  // Cheap structural sanity: must be valid base64 shape
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(base64Data.slice(0, 512)) || base64Data.length < 256) {
    return NextResponse.json({ error: 'invalid_image', message: 'imageBase64 is not decodable.' }, { status: 400 });
  }

  const safeCity = sanitizeCity(body.city);
  const city = isUsable(safeCity) ? canonicalCityName(safeCity) : 'Madurai';

  const prompt = `You are MARGINS — the wholesale pricing oracle for Indian shopkeepers.
${PROMPT_GUARD}
Analyze this image of a wholesale delivery invoice/memo (parchi) received at a kirana store in ${sanitizePromptText(city, 64)}.

Perform OCR on all visible line items and audit each line item against Indian wholesale benchmarks:
1. Extract distributor name, invoice number, and date if visible.
2. For each line item:
   - Identify product name, SKU or barcode if visible
   - Quantity and unit
   - Billed rate per unit (INR)
   - Total billed for that item
   - Estimate fair wholesale rate based on typical Indian wholesale benchmarks
   - State MRP if known
   - Discrepancy per unit (Billed rate - Fair rate)
   - Verdict: 'overpriced' | 'fair' | 'underpriced'
   - A crisp 1-sentence note
3. Check for any unapplied FMCG manufacturer schemes or missing freebies (e.g. 10+1 free, 12+1 free, volume rebates).
4. Summary:
   - totalBilled: sum of line items
   - totalFair: fair benchmark total
   - totalOvercharged: sum of positive discrepancies * qty
   - totalSchemeWithheld: value of missing freebies or unapplied schemes
   - totalRecoverable: totalOvercharged + totalSchemeWithheld
   - flaggedItemsCount: count of overpriced items
5. whatsAppDisputeNotice: A polite, firm, structured WhatsApp message formatted in markdown for the delivery boy / distributor stating invoice number, overcharged lines, missing schemes, and exact credit amount demanded.
6. actionableAdvice: 1-2 punchy sentences advising the shopkeeper whether to dispute the invoice, refuse lines, or demand a credit note.

Return JSON in this EXACT structure:
{
  "distributor": { "name": "string", "invoiceNo": "string", "date": "string", "city": "${sanitizePromptText(city, 64)}" },
  "items": [
    {
      "name": "string",
      "sku": "string",
      "qty": 10,
      "unit": "string",
      "rate": 100,
      "total": 1000,
      "mrp": 110,
      "benchmarkFairRate": 90,
      "discrepancy": 10,
      "verdict": "fair|overpriced|underpriced",
      "note": "string"
    }
  ],
  "schemes": [
    {
      "brand": "string",
      "scheme": "string",
      "status": "unapplied|applied",
      "impact": "string",
      "withheldValue": 100
    }
  ],
  "summary": {
    "totalBilled": 1000,
    "totalFair": 900,
    "totalOvercharged": 100,
    "totalSchemeWithheld": 50,
    "totalRecoverable": 150,
    "flaggedItemsCount": 1
  },
  "whatsAppDisputeNotice": "string",
  "actionableAdvice": "string"
}
Output valid JSON only.`;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };

  try {
    const result = await proModel().generateContent([prompt, imagePart as any]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(cleaned);
    parsed.analyzed_by = MODELS.pro;
    return NextResponse.json(parsed);
  } catch {
    // Fallback to flash vision
    try {
      const result = await flashModel().generateContent([prompt, imagePart as any]);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(cleaned);
      parsed.analyzed_by = MODELS.flash;
      return NextResponse.json(parsed);
    } catch (error) {
      // Return sample on any unexpected vision error so the user is never stuck
      return NextResponse.json({
        ...SAMPLE_INVOICE_AUDIT,
        fallback_reason: String(error).slice(0, 200),
      });
    }
  }
}

function isUsable(s: string): boolean {
  return s.trim().length >= 2;
}
