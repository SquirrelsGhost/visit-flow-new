import { parseConsent, serializeConsent, type Consent } from "@visit-flow/shared/consent";

/**
 * Die Entscheidung liegt lokal im Gerät (Web und Capacitor-App gleichermaßen).
 * Das Speichern der Entscheidung selbst ist technisch notwendig (§ 25 Abs. 2 Nr. 2 TDDDG).
 */
const STORAGE_KEY = "vf_consent";

export function readStoredConsent(): Consent | null {
  try {
    return parseConsent(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredConsent(consent: Consent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeConsent(consent));
  } catch {
    // Privater Modus oder voller Speicher: Die Auswahl gilt dann nur für diese Sitzung
  }
}

export function newConsentId(): string {
  return crypto.randomUUID();
}
