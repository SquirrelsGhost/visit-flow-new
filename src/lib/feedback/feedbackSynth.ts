/**
 * Kleine Klangbausteine über die Web Audio API. Alle Sounds entstehen live im Browser,
 * es gibt keine Audiodateien und damit keine Lizenzfragen.
 */

interface AudioSessionNavigator {
  audioSession?: { type: string };
}
interface WebkitWindow {
  webkitAudioContext?: typeof AudioContext;
}

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

/** Liefert den AudioContext (einmal angelegt). iOS gibt ihn erst nach einer Nutzer-Geste frei, siehe unlockAudio. */
export function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;
  // "ambient": folgt dem Stumm-Schalter des iPhones und unterbricht keine Musik (Safari 17+)
  const session = (navigator as AudioSessionNavigator).audioSession;
  if (session) session.type = "ambient";
  ctx = new Ctor({ latencyHint: "interactive" });
  return ctx;
}

/** Bei der ersten Berührung aufrufen: weckt den AudioContext, damit spätere Sounds sofort klingen. */
export function unlockAudio(): void {
  const audio = audioContext();
  if (audio && audio.state !== "running") void audio.resume().catch(() => undefined);
}

function noiseBuffer(audio: AudioContext): AudioBuffer {
  if (noise) return noise;
  noise = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.6), audio.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noise;
}

export interface ToneOptions {
  freq: number;
  /** Startzeit relativ zu jetzt in Sekunden. */
  at?: number;
  /** Dauer bis fast still, in Sekunden. */
  dur: number;
  peak: number;
  type?: OscillatorType;
  /** Gleitet in der Dauer zu dieser Frequenz. */
  toFreq?: number;
  attack?: number;
  /** Zweiter, leiser Oberton wie bei einer Glocke (Faktor 2,76), gibt Glanz. */
  bell?: boolean;
}

/** Ein weicher Ton mit kurzem Anschlag und exponentiellem Ausklingen. */
export function tone(out: AudioNode, { freq, at = 0, dur, peak, type = "sine", toFreq, attack = 0.006, bell }: ToneOptions): void {
  const audio = out.context as AudioContext;
  const start = audio.currentTime + at;
  const voice = (f: number, gainPeak: number, length: number, endF?: number) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, start);
    if (endF) osc.frequency.exponentialRampToValueAtTime(endF, start + length);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainPeak, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(out);
    osc.start(start);
    osc.stop(start + length + 0.05);
  };
  voice(freq, peak, dur, toFreq);
  if (bell) voice(freq * 2.76, peak * 0.18, dur * 0.45, toFreq ? toFreq * 2.76 : undefined);
}

export interface AirOptions {
  at?: number;
  dur: number;
  peak: number;
  from: number;
  to: number;
  /** Güte des Filters: höher = pfeifender, niedriger = luftiger. */
  q?: number;
}

/** Gefiltertes Rauschen, dessen Filter wandert: ein weicher Luftzug (Sheets) oder ein feines Klicken (sehr kurz). */
export function air(out: AudioNode, { at = 0, dur, peak, from, to, q = 1.2 }: AirOptions): void {
  const audio = out.context as AudioContext;
  const start = audio.currentTime + at;
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio);
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(to, start + dur);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.012, dur * 0.3) + dur * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(gain).connect(out);
  src.start(start, Math.random() * 0.2);
  src.stop(start + dur + 0.05);
}

/** Ausgang mit Gesamtlautstärke und sanftem Tiefpass, damit nichts spitz klingt. */
export function output(audio: AudioContext, volume: number): AudioNode {
  const master = audio.createGain();
  master.gain.value = volume;
  const soften = audio.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 7000;
  master.connect(soften).connect(audio.destination);
  return master;
}
