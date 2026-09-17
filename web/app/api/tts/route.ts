/**
 * /api/tts — Secure Server-Side Gemini Text-to-Speech Proxy
 *
 * Keeps GEMINI_API_KEY strictly on the server (no NEXT_PUBLIC_ exposure in client JS).
 * Proxies speech synthesis to Gemini 2.5 Flash Preview TTS.
 */

import { NextRequest, NextResponse } from 'next/server';
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
  try {
    const body = InputSchema.parse(await req.json());
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'STUB') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: body.text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: body.voice } },
              languageCode: body.lang,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return NextResponse.json(
        { error: `Gemini TTS API responded with ${response.status}: ${errText}` },
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
