/**
 * lib/live.ts — Gemini Live API utilities for the haggling scene
 *
 * SECURITY CHANGE (audit finding #6): the previous revision read
 * `process.env.NEXT_PUBLIC_GEMINI_API_KEY` — any value under that name is
 * bundled into shipped client JavaScript, i.e. a public API key. That path
 * has been removed. Browser-direct Live sessions are therefore DISABLED by
 * design until a server-brokered token flow exists (Gemini's public API has
 * no short-lived client token for the Live WebSocket).
 *
 * What still works today:
 *  - Voice for the haggling scene is synthesized server-side via /api/tts
 *    (key stays on the server) — see web/app/haggle/page.tsx.
 *
 * What remains here: pure browser-audio utilities (PCM playback queue and
 * 16 kHz microphone capture) that any future server-brokered streaming
 * client will need.
 */

export type LiveCallbacks = {
  onAudio?: (pcm: ArrayBuffer) => void;
  onText?: (text: string, finished: boolean) => void;
  onTurnComplete?: () => void;
  onError?: (e: Error) => void;
  onClose?: () => void;
};

/**
 * Disabled intentionally. Attempting to start a browser-direct Live session
 * throws with migration guidance instead of silently requiring a public key.
 */
export async function startLiveSession(_voice: string, callbacks: LiveCallbacks) {
  const err = new Error(
    '[margins] Browser-direct Gemini Live sessions are disabled for key safety. ' +
    'Voice is served server-side via /api/tts; wire a server-brokered Live token flow before re-enabling.',
  );
  callbacks.onError?.(err);
  throw err;
}

/** Play raw PCM (16-bit LE mono) at `rate` Hz via Web Audio API. */
export function pcmPlayer(rate = 24000) {
  const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctor({ sampleRate: rate });
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
      const audio = ctx.createBuffer(1, f32.length, rate);
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

/** Capture mic at 16kHz mono PCM. Returns a stop() teardown. */
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
