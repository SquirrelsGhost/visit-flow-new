import { useCallback, useSyncExternalStore } from "react";
import { CONSENT_CHANGED_EVENT, CONSENT_VERSION, type Consent, type ConsentChoice, type ConsentSource } from "@visit-flow/shared/consent";
import { logConsent } from "../lib/consentLog";
import { newConsentId, readStoredConsent, writeStoredConsent } from "../lib/consentStorage";

// Rohwert als Snapshot, damit useSyncExternalStore stabile Werte vergleicht
const snapshot = (): string => JSON.stringify(readStoredConsent());

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export interface ConsentState {
  /** null = noch keine (gültige) Entscheidung, der Banner erscheint. */
  consent: Consent | null;
  save: (choice: ConsentChoice, source: ConsentSource) => void;
}

/** Liest und speichert die Einwilligung. Alle Komponenten bleiben über ein Fenster-Ereignis synchron. */
export function useConsent(): ConsentState {
  const raw = useSyncExternalStore(subscribe, snapshot);
  const consent = JSON.parse(raw) as Consent | null;

  const save = useCallback((choice: ConsentChoice, source: ConsentSource) => {
    const previous = readStoredConsent();
    const next: Consent = { id: previous?.id ?? newConsentId(), v: CONSENT_VERSION, at: new Date().toISOString(), choice };
    writeStoredConsent(next);
    logConsent(next, source);
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  }, []);

  return { consent, save };
}
