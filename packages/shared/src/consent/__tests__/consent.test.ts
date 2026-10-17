import { describe, expect, it } from "vitest";
import { CONSENT_VERSION, parseConsent, serializeConsent, type Consent } from "../consent";
import { consentLogInputSchema } from "../consentSchema";

const NOW = Date.parse("2026-10-17T12:00:00Z");
const base: Consent = { id: "abc-12345", v: CONSENT_VERSION, at: "2026-10-01T12:00:00Z", choice: { extern: true } };

describe("parseConsent", () => {
  it("liest eine gültige Entscheidung", () => {
    expect(parseConsent(serializeConsent(base), NOW)).toEqual(base);
  });

  it("verwirft eine alte Version, damit neu gefragt wird", () => {
    expect(parseConsent(serializeConsent({ ...base, v: CONSENT_VERSION + 1 }), NOW)).toBeNull();
  });

  it("verwirft eine Entscheidung nach 12 Monaten", () => {
    expect(parseConsent(serializeConsent({ ...base, at: "2025-10-01T12:00:00Z" }), NOW)).toBeNull();
  });

  it("wertet alles außer true als abgelehnt", () => {
    const raw = JSON.stringify({ ...base, choice: { extern: "yes" } });
    expect(parseConsent(raw, NOW)?.choice.extern).toBe(false);
  });

  it("verträgt kaputte Werte", () => {
    expect(parseConsent("{kaputt", NOW)).toBeNull();
    expect(parseConsent(null, NOW)).toBeNull();
  });
});

describe("consentLogInputSchema", () => {
  it("lehnt unbekannte Kategorien ab", () => {
    const result = consentLogInputSchema.safeParse({ id: "abc-12345", v: CONSENT_VERSION, choice: { extern: true, tracking: true }, source: "banner" });
    expect(result.success).toBe(false);
  });

  it("akzeptiert eine gültige Eingabe", () => {
    const result = consentLogInputSchema.safeParse({ id: "abc-12345", v: CONSENT_VERSION, choice: { extern: false }, source: "banner" });
    expect(result.success).toBe(true);
  });
});
