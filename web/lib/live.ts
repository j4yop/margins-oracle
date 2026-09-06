/**
 * Gemini Live API client — bidi voice for the haggling scene.
 *
 * Uses the Live API WebSocket endpoint. The full setup requires the
 * official @google/generative-ai SDK with the live connection helpers
 * (or a direct WebSocket). For hackathon scope we use the SDK's
 * `live.connect()` pattern.
 *
 * The Live API model for free preview is `gemini-2.0-flash-live-001`
 * or `gemini-2.0-flash-exp`. Voice: Aoede (default), Kore, Leda, etc.
 *
 * Free tier: ~5 minutes per session in preview.
 */

import { GoogleGenerativeAI, Modality } from '@google/generative-ai';

export type LiveCallbacks = {
  onAudio?: (pcm: ArrayBuffer) => void;
  onText?: (text: string, finished: boolean) => void;
  onTurnComplete?: () => void;
  onError?: (e: Error) => void;
  onClose?: () => void;
};

const LIVE_MODEL = process.env.GEMINI_MODEL_LIVE ?? 'gemini-2.0-flash-live-001';

const HAGGLING_SYSTEM_PROMPT = `You are MARGINS, an AI co-pilot for Indian shopkeepers. The user is a Madurai kirana owner haggling with a wholesale supplier over a phone call. The supplier just quoted an unfair price. The user is speaking in Tamil or Hindi.

Your job:
- Listen to what the supplier says (via the user's relay).
- Whisper back to the user in their language, briefly, with the right counter-offer and a sharp one-liner to use.
- Keep replies under 8 seconds of speech. Be direct, colloquial, and a little aggressive (in a Tamil-mama way).
- Always end by saying what to do next: "say X" or "walk away" or "settle at ₹Y".

Never break character. Never speak English unless asked. Never explain your reasoning out loud — just the line.`;

/**
 * Start a Live API session. Returns a handle with .send() and .close().
 *
 * Browser usage:
 *   const live = await startLiveSession({ onAudio, onText });
 *   // stream mic PCM at 16kHz to live.sendAudio()
 *   live.close();
 */
export async function startLiveSession(voice: string, callbacks: LiveCallbacks) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    callbacks.onError?.(new Error('GEMINI_API_KEY not configured'));
    return { sendAudio: () => {}, sendText: () => {}, close: () => {} };
  }

  const genai = new GoogleGenerativeAI(apiKey);
  const session = await genai.live.connect({
    model: LIVE_MODEL,
    callbacks: {
      onopen: () => console.log('[live] connected'),
      onmessage: (msg: any) => {
        if (msg.serverContent?.modelTurn?.parts) {
          for (const part of msg.serverContent.modelTurn.parts) {
            if (part.inlineData?.data) {
              // base64 PCM
              const bin = atob(part.inlineData.data);
              const buf = new ArrayBuffer(bin.length);
              const view = new Uint8Array(buf);
              for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
              callbacks.onAudio?.(buf);
            }
            if (part.text) {
              const finished = !!msg.serverContent?.turnComplete;
              callbacks.onText?.(part.text, finished);
            }
          }
        }
        if (msg.serverContent?.turnComplete) {
          callbacks.onTurnComplete?.();
        }
      },
      onerror: (e: any) => callbacks.onError?.(new Error(String(e?.message ?? e))),
      onclose: () => callbacks.onClose?.(),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
      },
      systemInstruction: { parts: [{ text: HAGGLING_SYSTEM_PROMPT }] },
    },
  });

  return {
    sendAudio: (pcm: ArrayBuffer) => session.sendRealtimeInput({ audio: { data: arrayBufferToBase64(pcm), mimeType: 'audio/pcm;rate=16000' } }),
    sendText: (text: string) => session.sendClientContent({ turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true }),
    close: () => session.close(),
  };
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

/** Play raw PCM 16kHz mono audio via Web Audio API. */
export function pcmPlayer() {
  const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctor({ sampleRate: 24000 }); // Live API emits 24kHz
  const queue: ArrayBuffer[] = [];
  let playing = false;

  async function play() {
    if (playing) return;
    playing = true;
    while (queue.length) {
      const buf = queue.shift()!;
      const f32 = new Float32Array(buf.byteLength / 2);
      const view = new DataView(buf);
      for (let i = 0; i < f32.length; i++) f32[i] = view.getInt16(i * 2, true) / 32768;
      const audio = ctx.createBuffer(1, f32.length, 24000);
      audio.getChannelData(0).set(f32);
      const src = ctx.createBufferSource();
      src.buffer = audio;
      src.connect(ctx.destination);
      await new Promise<void>((r) => { src.onended = () => r(); src.start(); });
    }
    playing = false;
  }

  return {
    feed(buf: ArrayBuffer) { queue.push(buf); play(); },
    close: () => ctx.close(),
  };
}

/** Capture mic at 16kHz mono PCM. */
export async function micCapture(onFrame: (pcm: ArrayBuffer) => void): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
  const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctor({ sampleRate: 16000 });
  const src = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  proc.onaudioprocess = (e) => {
    const f32 = e.inputBuffer.getChannelData(0);
    const i16 = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
    onFrame(i16.buffer);
  };
  src.connect(proc);
  proc.connect(ctx.destination);
  return () => {
    proc.disconnect();
    src.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    ctx.close();
  };
}