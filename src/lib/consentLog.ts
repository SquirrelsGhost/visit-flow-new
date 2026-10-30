import type { Consent, ConsentSource } from "@/shared/consent/consent";
import type { ConsentLogInput } from "@/shared/consent/consentSchema";
import { apiRequest } from "./apiClient";

/** Nachweis auf dem Server (Art. 7 Abs. 1 DSGVO). Ein Fehler blockiert die Auswahl nie. */
export function logConsent(consent: Consent, source: ConsentSource): void {
  const body: ConsentLogInput = { id: consent.id, v: consent.v as ConsentLogInput["v"], choice: consent.choice, source };
  void apiRequest("/consent", { method: "POST", body: JSON.stringify(body), keepalive: true });
}
