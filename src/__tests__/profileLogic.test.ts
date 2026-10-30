import { describe, expect, it } from "vitest";
import { billingLines, readProfile } from "../lib/profile/profileFields";
import { normalizeInvoices, normalizeSubscription } from "../lib/profile/profileNormalize";
import { isJuniorMonth, nicknameDaysLeft, nicknameError, passwordError, tierOf } from "../lib/profile/profileRules";

const DAY = 86_400_000;

describe("Profilfelder aus dem v1-Benutzer", () => {
  it("liest Mongo-IDs, Vertragsmonat und Rechnungsadresse", () => {
    const profile = readProfile({
      id: "u1",
      email: "max@test.de",
      role: "berater",
      name: " Max ",
      teamId: { $oid: "t42" },
      vodafoneContractStart: "2026-01-01",
      vodafoneCurrentMonth: 6,
      billingStreet: "Hauptstr. 1",
      billingZip: "10115",
      billingCity: "Berlin",
      isAnonymousInLeaderboard: true,
    });
    expect(profile).toMatchObject({ name: "Max", teamId: "t42", contractMonth: 6, anonymous: true });
    expect(billingLines(profile.billing)).toEqual(["Hauptstr. 1", "10115 Berlin"]);
  });

  it("ohne Vertragsstart gibt es keinen Vodafone-Monat und der Name fällt auf die E-Mail zurück", () => {
    const profile = readProfile({ id: "u1", email: "max@test.de", role: "berater", vodafoneCurrentMonth: 3 });
    expect(profile.contractMonth).toBeNull();
    expect(profile.name).toBe("max@test.de");
  });
});

describe("Regeln wie der v1-Server", () => {
  it("prüft den Nickname", () => {
    expect(nicknameError("")).toMatch(/leer/);
    expect(nicknameError("max power")).toMatch(/Leerzeichen/);
    expect(nicknameError("a".repeat(21))).toMatch(/20/);
    expect(nicknameError("maxpower")).toBeNull();
  });

  it("sperrt den Nickname 7 Tage nach einer Änderung", () => {
    const now = Date.UTC(2026, 9, 23);
    expect(nicknameDaysLeft(undefined, now)).toBe(0);
    expect(nicknameDaysLeft(new Date(now - 2 * DAY).toISOString(), now)).toBe(5);
    expect(nicknameDaysLeft(new Date(now - 8 * DAY).toISOString(), now)).toBe(0);
  });

  it("verlangt beim Passwort das aktuelle, 8 Zeichen, ein neues und die Wiederholung", () => {
    expect(passwordError({ current: "", next: "neuesPasswort", confirm: "neuesPasswort" })).toMatch(/erforderlich/);
    expect(passwordError({ current: "alt", next: "kurz", confirm: "kurz" })).toMatch(/8 Zeichen/);
    expect(passwordError({ current: "gleich123", next: "gleich123", confirm: "gleich123" })).toMatch(/unterscheiden/);
    expect(passwordError({ current: "alt", next: "neuesPasswort", confirm: "anders123" })).toMatch(/stimmen nicht/);
    expect(passwordError({ current: "alt", next: "neuesPasswort", confirm: "neuesPasswort" })).toBeNull();
  });

  it("ordnet Level und Vertragsmonate wie v1 ein", () => {
    expect([1, 20, 21, 41, 61, 81].map(tierOf)).toEqual(["bronze", "bronze", "silver", "gold", "platinum", "diamond"]);
    expect([0, 1, 4, 5].map(isJuniorMonth)).toEqual([false, true, true, false]);
  });
});

describe("Antworten der v1-API", () => {
  it("macht aus Abo und Rechnungen saubere Werte", () => {
    expect(normalizeSubscription({ planId: "pro", status: "trialing", price: "1999" })).toEqual({ planId: "pro", status: "inactive", price: 1999, features: [] });
    expect(normalizeSubscription(null)).toBeNull();
    expect(normalizeSubscription({ status: "active", licenseCount: 10, usedLicenses: 12 })?.licenses).toEqual({ total: 10, used: 10 });
    const [invoice] = normalizeInvoices([{ _id: "i1", status: "paid", amount: 6500, paidAt: "2026-10-01", invoicePdf: "https://x/pdf" }]);
    expect(invoice).toEqual({ id: "i1", status: "paid", date: "2026-10-01", amount: 6500, description: undefined, url: "https://x/pdf" });
  });
});
