import { describe, expect, it } from "vitest";
import { loginErrorKind } from "../lib/auth/loginErrorKind";
import { redirectTarget } from "../lib/auth/redirectTarget";
import { cardinalDirection, qiblaDirection } from "../lib/geo/qibla";

describe("loginErrorKind", () => {
  it("erkennt die Fehlerarten wie v1 am Text", () => {
    expect(loginErrorKind("Ihre IP-Adresse wurde gesperrt")).toBe("ipBlocked");
    expect(loginErrorKind("Zu viele fehlgeschlagene Login-Versuche")).toBe("rateLimit");
    expect(loginErrorKind("Verbindung zum Server fehlgeschlagen")).toBe("network");
    expect(loginErrorKind("E-Mail-Adresse oder Passwort ist falsch.")).toBe("generic");
  });
});

describe("redirectTarget", () => {
  it("führt zur vorher geschützten Seite zurück", () => {
    expect(redirectTarget({ from: { pathname: "/kalender", search: "?d=1", hash: "#x" } })).toBe("/kalender?d=1#x");
  });

  it("nimmt sonst das Dashboard und lässt keine fremden Adressen zu", () => {
    expect(redirectTarget(null)).toBe("/dashboard");
    expect(redirectTarget({ from: { pathname: "//boese.example" } })).toBe("/dashboard");
    expect(redirectTarget({ from: { pathname: "https://boese.example" } })).toBe("/dashboard");
  });
});

describe("Qibla", () => {
  it("berechnet die Richtung nach Mekka", () => {
    const berlin = qiblaDirection(52.52, 13.405);
    expect(berlin).toBeGreaterThan(134);
    expect(berlin).toBeLessThan(138);
    expect(cardinalDirection(berlin)).toBe("SO");
    expect(cardinalDirection(berlin, "en")).toBe("SE");
  });
});
