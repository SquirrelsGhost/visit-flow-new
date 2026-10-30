/**
 * Sprachansage der Ident-Schritte über die Sprachausgabe des Geräts (läuft lokal, nichts geht ins Netz).
 * Aus- und Einschalten merkt sich der Browser.
 */
const STORAGE_KEY = "vf_ident_voice";
let lastText = "";
let lastAt = 0;

export function isVoiceEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setVoiceEnabled(on: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // ohne Speicher gilt die Einstellung nur bis zum Neuladen
  }
  if (!on) cancelVoice();
}

export function cancelVoice(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Spricht einen Satz auf Deutsch; derselbe Satz wird nicht öfter als alle 4 s wiederholt. */
export function speak(text: string, { interrupt = true } = {}): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !isVoiceEnabled()) return;
  const now = Date.now();
  if (text === lastText && now - lastAt < 4000) return;
  lastText = text;
  lastAt = now;
  const synth = window.speechSynthesis;
  if (interrupt) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = 1.02;
  utterance.voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("de")) ?? null;
  synth.speak(utterance);
}
