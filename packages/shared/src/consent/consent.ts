/**
 * Einwilligung (Cookie-/Speicher-Banner) nach § 25 TDDDG und Art. 6/7 DSGVO.
 *
 * Die Entscheidung liegt beim Besucher (lokal gespeichert, ohne Personenbezug:
 * Auswahl, Zufalls-ID, Zeitpunkt, Version). Derselbe Eintrag geht als Nachweis
 * nach Art. 7 Abs. 1 DSGVO ans Protokoll auf dem Server, ohne IP und User-Agent.
 */

/** Wird erhöht, wenn sich Kategorien oder Anbieter ändern: alle werden neu gefragt. */
export const CONSENT_VERSION = 1;
/** Nach 12 Monaten wird neu gefragt. */
export const CONSENT_VALID_DAYS = 365;
/** Fenster-Ereignis: Einstellungen öffnen (Footer-Link, Datenschutzseite). */
export const CONSENT_OPEN_EVENT = "vf:consent-open";
/** Fenster-Ereignis: Auswahl hat sich geändert (z. B. Widerruf). */
export const CONSENT_CHANGED_EVENT = "vf:consent-changed";

/** Kategorien, die eine Einwilligung brauchen. "notwendig" ist immer an und wird nicht gespeichert. */
export const CONSENT_CATEGORIES = ["extern"] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];
export type ConsentChoice = Record<ConsentCategory, boolean>;

/** Woher die Entscheidung kam (fürs Protokoll). */
export const CONSENT_SOURCES = ["banner", "einstellungen", "inhalt"] as const;
export type ConsentSource = (typeof CONSENT_SOURCES)[number];

export interface Consent {
  /** Zufällige Kennung dieser Entscheidung; steht auch im Protokoll. */
  id: string;
  v: number;
  /** ISO-Zeitpunkt der Entscheidung. */
  at: string;
  choice: ConsentChoice;
}

export const NO_CHOICE: ConsentChoice = { extern: false };
export const ALL_CHOICE: ConsentChoice = { extern: true };

const DAY_MS = 24 * 60 * 60 * 1000;

/** Liest einen gespeicherten Wert. Ungültig, veraltet oder abgelaufen = null (Banner erscheint erneut). */
export function parseConsent(raw: string | null | undefined, now = Date.now()): Consent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Consent>;
    if (parsed.v !== CONSENT_VERSION || typeof parsed.id !== "string" || typeof parsed.at !== "string") return null;
    const time = Date.parse(parsed.at);
    if (!Number.isFinite(time) || now - time > CONSENT_VALID_DAYS * DAY_MS) return null;
    const choice = { ...NO_CHOICE };
    for (const category of CONSENT_CATEGORIES) choice[category] = parsed.choice?.[category] === true;
    return { id: parsed.id, v: parsed.v, at: parsed.at, choice };
  } catch {
    return null;
  }
}

export function serializeConsent(consent: Consent): string {
  return JSON.stringify(consent);
}
