/**
 * /api/tts — Secure Server-Side Gemini Text-to-Speech Proxy
 *
 * Keeps GEMINI_API_KEY strictly on the server (no NEXT_PUBLIC_ exposure in
 * client JS). Proxies speech synthesis to Gemini 2.5 Flash Preview TTS.
 *
 * Post-audit: per-IP rate limit (audio synthesis is quota-expensive) and
 * control-character stripping on the spoken text.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TTS_MODEL = process.env.GEMINI_MODEL_TTS ?? 'gemini-2.5-flash-preview-tts';

const InputSchema = z.object({
  text: z.string().min(1).max(1000),
  voice: z.enum(['Kore', 'Aoede', 'Leda', 'Orus', 'Puck', 'Charon', 'Fenrir']).default('Kore'),
  lang: z.enum(['ta-IN', 'hi-IN', 'en-IN', 'bn-IN', 'te-IN']).default('ta-IN'),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 'tts', 15);
  if (!rl.ok) return tooManyRequests(rl);

  let body: z.infer<typeof InputSchema>;
  try {
    body = InputSchema.parse(await req.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // Strip control characters from spoken text (prompt-hygiene)
  // eslint-disable-next-line no-control-regex
  const cleanText = body.text.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 1000);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'STUB') {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: cleanText }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: body.voice } },
              languageCode: body.lang,
            },
          },
        }),
        signal: AbortSignal.timeout(20_000),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return NextResponse.json(
        { error: `Gemini TTS API responded with ${response.status}: ${errText.slice(0, 200)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const inlineAudio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!inlineAudio) {
      return NextResponse.json(
        { error: 'No audio data returned by Gemini TTS' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      audioB64: inlineAudio,
      mimeType: data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType ?? 'audio/wav',
      voice: body.voice,
      lang: body.lang,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error).slice(0, 200) }, { status: 500 });
  }
}
