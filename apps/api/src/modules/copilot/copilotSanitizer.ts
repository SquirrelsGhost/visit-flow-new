/**
 * Schutz vor dem Versand an das Sprachmodell (aus v1 services/enes/sanitizer.ts): personenbezogene
 * Freitexte werden geschwärzt, der Vorname des Beraters wird zu "Agent" und in der Antwort zurückgesetzt.
 * Bewusst konservativ: Telefon nur mit Vorwahl-Präfix, Adresse nur Straße plus Hausnummer.
 */
const PII_RULES: readonly [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]{2,}/g, "[EMAIL]"],
  [/\b[A-Z]{2}\d{2}(?:[ ]?\d){12,}\b/g, "[IBAN]"],
  [/(?:\+49|0049|0)[\d\s/().-]{7,}\d/g, "[TEL]"],
  [/\b[A-ZÄÖÜ][A-Za-zÄÖÜäöüß.-]*\s?(?:stra(?:ß|ss)e|str\.|weg|allee|platz|gasse|ring|damm)\s+\d+\s?[a-zA-Z]?\b/gi, "[ADRESSE]"],
];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PLACEHOLDER = "Agent";

export function redactPii(text: string): string {
  let out = text;
  for (const [pattern, replacement] of PII_RULES) out = out.replace(pattern, replacement);
  return out;
}

export interface Sanitizer {
  /** Vor dem Versand: Name maskieren, PII schwärzen. */
  outbound(text: string): string;
  /** In der Antwort: Platzhalter wieder durch den Vornamen ersetzen. */
  inbound(text: string): string;
}

export function createSanitizer(firstName?: string): Sanitizer {
  const name = firstName && firstName.trim().length >= 2 ? firstName.trim() : null;
  const namePattern = name ? new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi") : null;
  return {
    outbound: (text) => redactPii(namePattern ? text.replace(namePattern, PLACEHOLDER) : text),
    inbound: (text) => (name ? text.replace(/\bAgent\b/g, name) : text),
  };
}
