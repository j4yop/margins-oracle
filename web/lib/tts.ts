/**
 * lib/tts.ts — Gemini TTS for the haggling scene
 *
 * Free models: gemini-2.5-flash-preview-tts
 * Supports 24+ languages including Tamil, Hindi, Bengali, Marathi, etc.
 * Returns base64 audio (mp3 or wav) that we play via <audio> element.
 */

const TTS_MODEL = process.env.GEMINI_MODEL_TTS ?? 'gemini-2.5-flash-preview-tts';

export type TTSOpts = {
  text: string;
  voice?: 'Kore' | 'Aoede' | 'Leda' | 'Orus' | 'Puck' | 'Charon' | 'Fenrir' | 'Aoede' | 'Leda' | 'Orus';
  lang?: 'ta-IN' | 'hi-IN' | 'en-IN' | 'bn-IN' | 'te-IN';
};

export async function synthesizeSpeech({ text, voice = 'Kore', lang = 'ta-IN' }: TTSOpts): Promise<string> {
  const r = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, lang }),
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
    throw new Error(err.error || `TTS failed with status ${r.status}`);
  }

  const d = await r.json();
  if (!d?.audioB64) throw new Error('no audio in response');
  return d.audioB64; // base64 audio (wav typically)
}

/** Convert base64 audio to a Blob URL the browser can play. */
export function audioBlobUrl(b64: string, mime = 'audio/wav'): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}