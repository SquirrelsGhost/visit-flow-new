import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { effectiveUserPermissions, hasPermission, permissionsForRole } from "../lib/permissions";
import { findPolicy } from "../lib/routePolicies";
import { getFingerprint, holeGeraetFingerprint } from "../lib/security/fingerprint";
import { pruefeLoginBotSchutz } from "../lib/sicherheit/botSchutz";
import { loeseLoginPoW } from "../lib/sicherheit/botSchutzClient";
import { istWegwerfEmail, kanonischeEmail } from "../lib/sicherheit/emailSchutz";
import { proxy } from "../proxy";
import { LoginBackoffService } from "../services/sicherheit/LoginBackoffService";
import { createSessionToken, readSessionToken, VF_SESSION_COOKIE } from "../services/sicherheit/SessionToken";
import {
  erhoeheSitzungsVersion,
  getSessionUser,
  resetKontenFuerTests,
  sperreKonto,
  upsertSessionAccount,
} from "../services/sicherheit/SessionUserService";
import {
  PARALLEL_TOLERANZ_MS,
  ROTATION_INTERVALL_MS,
  Sitzungswachdienst,
} from "../services/sicherheit/Sitzungswachdienst";

describe("1. Pure Capability-Based Access Control (Permissions)", () => {
  it("prüft Wildcards (*, <domain>:*) und Domänen-Hierarchien", () => {
    expect(hasPermission(["*"], "admin:security")).toBe(true);
    expect(hasPermission(["admin:*"], "admin:security")).toBe(true);
    expect(hasPermission(["admin:*"], "streets:struktur")).toBe(true);
    expect(hasPermission(["streets:struktur"], "streets:mentor")).toBe(true);
    expect(hasPermission(["streets:mentor"], "streets:struktur")).toBe(false);
    expect(hasPermission(["crm:own"], "crm:team")).toBe(false);
    expect(hasPermission(["crm:team"], "crm:own")).toBe(true);
  });

  it("kombiniert Rollen-Presets mit expliziten Sonder-Capabilities und leert Rechte sofort bei Sperre", () => {
    const beraterMitBackoffice = effectiveUserPermissions({
      role: "berater",
      permissions: ["team:backoffice"],
      partnerStatus: "approved",
    });
    expect(hasPermission(beraterMitBackoffice, "team:backoffice")).toBe(true);
    expect(hasPermission(beraterMitBackoffice, "partner:dashboard")).toBe(true);
    expect(hasPermission(beraterMitBackoffice, "admin:security")).toBe(false);

    const gesperrt = effectiveUserPermissions({
      role: "admin",
      permissions: ["*"],
      banned: true,
    });
    expect(gesperrt).toEqual([]);
    expect(permissionsForRole("admin")).toContain("*");
  });
});

describe("2. Stateful Server-Session & Anti-Theft Watchdog (Sitzungswachdienst)", () => {
  beforeEach(() => {
    Sitzungswachdienst.resetFuerTests();
    resetKontenFuerTests();
  });

  it("speichert keine Permissions im Cookie und prüft HMAC-Signatur", () => {
    const token = createSessionToken({
      id: "u-42",
      version: 1,
      sessionId: "sid-1",
      tokenId: "jti-1",
    });
    const decodedPayload = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString("utf8"));
    expect(decodedPayload).not.toHaveProperty("permissions");
    expect(decodedPayload).not.toHaveProperty("role");
    expect(readSessionToken(token)?.id).toBe("u-42");
    expect(readSessionToken(`${token}manipuliert`)).toBeNull();
  });

  it("rotiert tokenId nach 15 Minuten (mit 60s Parallel-Toleranz) und widerruft alle Sitzungen bei Token-Reuse", async () => {
    const t0 = 1_700_000_000_000;
    const req = new Request("http://localhost/api/session", {
      headers: { "user-agent": "Mozilla/5.0 Chrome/120.0" },
    });
    const sitzung1 = await Sitzungswachdienst.erstelleSitzung("u-1", "Emre", 3600, req, t0);
    const sitzung2 = await Sitzungswachdienst.erstelleSitzung("u-1", "Emre", 3600, req, t0);

    // Nach 16 Minuten: Rotation erzeugt neues tokenId
    const tRot = t0 + ROTATION_INTERVALL_MS + 60_000;
    const rotRes = await Sitzungswachdienst.pruefeUndAktualisiere(
      sitzung1.id,
      sitzung1.aktivesTokenId,
      "Mozilla/5.0 Chrome/120.0",
      true,
      tRot,
    );
    expect(rotRes.gueltig).toBe(true);
    expect(rotRes.neuesTokenId).toBeDefined();
    const neuesJti = rotRes.neuesTokenId!;

    // Innerhalb der 60s Parallel-Toleranz ist das alte Token noch gültig
    const parallelRes = await Sitzungswachdienst.pruefeUndAktualisiere(
      sitzung1.id,
      sitzung1.aktivesTokenId,
      "Mozilla/5.0 Chrome/120.0",
      false,
      tRot + 10_000,
    );
    expect(parallelRes.gueltig).toBe(true);

    // Nach Ablauf der 60s Toleranz wird ein erneuter Sendeversuch des alten Tokens als Diebstahl erkannt
    const reuseRes = await Sitzungswachdienst.pruefeUndAktualisiere(
      sitzung1.id,
      sitzung1.aktivesTokenId,
      "Mozilla/5.0 Chrome/120.0",
      false,
      tRot + PARALLEL_TOLERANZ_MS + 5_000,
    );
    expect(reuseRes.gueltig).toBe(false);
    expect(reuseRes.diebstahlErkannt).toBe(true);

    // Auch die zweite Sitzung des Nutzers sowie das neue Token wurden sofort widerrufen
    const nachDiebstahl1 = await Sitzungswachdienst.pruefeUndAktualisiere(
      sitzung1.id,
      neuesJti,
      "Mozilla/5.0 Chrome/120.0",
      false,
      tRot + PARALLEL_TOLERANZ_MS + 6_000,
    );
    const nachDiebstahl2 = await Sitzungswachdienst.pruefeUndAktualisiere(
      sitzung2.id,
      sitzung2.aktivesTokenId,
      "Mozilla/5.0 Chrome/120.0",
      false,
      tRot + PARALLEL_TOLERANZ_MS + 6_000,
    );
    expect(nachDiebstahl1.gueltig).toBe(false);
    expect(nachDiebstahl2.gueltig).toBe(false);
  });

  it("blockiert abweichende User-Agent-Signaturen sowie Echtzeit-Sperren und Versions-Erhöhungen", async () => {
    const ua = "Mozilla/5.0 Firefox/121.0";
    upsertSessionAccount({ id: "u-99", email: "berater@pycie.com", role: "berater", name: "Berater" });
    const reqCreate = new Request("http://localhost/api/session", { headers: { "user-agent": ua } });
    const sitzung = await Sitzungswachdienst.erstelleSitzung("u-99", "Berater", 3600, reqCreate);
    const cookieVal = createSessionToken({
      id: "u-99",
      version: 1,
      sessionId: sitzung.id,
      tokenId: sitzung.aktivesTokenId,
    });

    const validReq = new Request("http://localhost/api/session", {
      headers: { "user-agent": ua, cookie: `${VF_SESSION_COOKIE}=${encodeURIComponent(cookieVal)}` },
    });
    const user = await getSessionUser(validReq);
    expect(user?.id).toBe("u-99");
    expect(user?.banned).toBe(false);

    // Passwort-Reset / sitzungsVersion erhöhen -> Cookie sofort ungültig
    await erhoeheSitzungsVersion("u-99");
    expect(await getSessionUser(validReq)).toBeNull();

    // Neue Sitzung nach Passwort-Reset, dann Echtzeit-Sperre -> banned: true
    const sitzungNeu = await Sitzungswachdienst.erstelleSitzung("u-99", "Berater", 3600, reqCreate);
    const cookieNeu = createSessionToken({
      id: "u-99",
      version: 2,
      sessionId: sitzungNeu.id,
      tokenId: sitzungNeu.aktivesTokenId,
    });
    await sperreKonto("u-99", "Datenabfluss");
    const bannedReq = new Request("http://localhost/api/session", {
      headers: { "user-agent": ua, cookie: `${VF_SESSION_COOKIE}=${encodeURIComponent(cookieNeu)}` },
    });
    const bannedUser = await getSessionUser(bannedReq);
    expect(bannedUser?.banned).toBe(true);
    expect(bannedUser?.permissions).toEqual([]);
  });
});

describe("3. Login- & Registrierungs-Härtung (PoW, Honeypot, E-Mail, Fingerprint, Backoff)", () => {
  beforeEach(() => {
    LoginBackoffService.resetFuerTests();
  });

  it("löst Browser Micro-PoW (000 Präfix) und weist Honeypot sowie gefälschte Nonces ab", async () => {
    const pow = await loeseLoginPoW();
    expect(pruefeLoginBotSchutz({ powTs: pow.powTs, powNonce: pow.powNonce, honeypot: "" })).toEqual({ ok: true });
    expect(pruefeLoginBotSchutz({ powTs: pow.powTs, powNonce: pow.powNonce, honeypot: "https://spam.bot" }).ok).toBe(false);
    expect(pruefeLoginBotSchutz({ powTs: pow.powTs, powNonce: -999 }).ok).toBe(false);
  });

  it("normalisiert kanonische E-Mail-Aliase und blockiert Wegwerf-Domains", () => {
    expect(kanonischeEmail(" M.A.X+test1@googlemail.com ")).toBe("max@gmail.com");
    expect(istWegwerfEmail("angreifer@10minutemail.com")).toBe(true);
    expect(istWegwerfEmail("sub.trashmail.de")).toBe(true);
    expect(istWegwerfEmail("test@yopmail.com")).toBe(true);
    expect(istWegwerfEmail("emre@pycie.com")).toBe(false);
  });

  it("liefert sowohl HW-... Hardware-Fingerprint als auch VF-... Wasserzeichen-Fingerprint", () => {
    expect(holeGeraetFingerprint()).toMatch(/^HW-[0-9A-F]{12}$/);
    expect(getFingerprint()).toMatch(/^VF-/);
  });

  it("erzwingt exponentielles Backoff pro IP, kanonischer E-Mail und Hardware-ID", () => {
    const t0 = 1_700_000_000_000;
    for (let i = 0; i < 4; i++) {
      LoginBackoffService.registriereFehlversuch("10.0.0.1", "M.A.X+1@googlemail.com", "HW-ABCDEF123456", t0);
    }
    expect(LoginBackoffService.pruefeSperre("10.0.0.1", "max@gmail.com", "HW-ABCDEF123456", t0).gesperrt).toBe(false);

    // 5. Fehlversuch mit anderem Alias derselben kanonischen Adresse löst Backoff aus
    LoginBackoffService.registriereFehlversuch("10.0.0.2", "max+2@gmail.com", "HW-000000000000", t0);
    const sperre1 = LoginBackoffService.pruefeSperre("10.0.0.9", "max@gmail.com", undefined, t0 + 1000);
    expect(sperre1.gesperrt).toBe(true);
    expect(sperre1.restSekunden).toBe(4);
  });
});

describe("4. Next.js 16 Zero-Trust src/proxy.ts (5-Schritte-Engine)", () => {
  beforeEach(() => {
    Sitzungswachdienst.resetFuerTests();
    resetKontenFuerTests();
  });

  it("Schritt 1 & 2: blockiert unbekannte Routen (Deny by default = 403) und lässt Public-Routen durch", async () => {
    expect(findPolicy("DELETE", "/unbekannter-pfad")).toBeNull();
    const denyRes = await proxy(new NextRequest("http://localhost/unbekannter-pfad", { method: "DELETE" }));
    expect(denyRes.status).toBe(403);

    const publicRes = await proxy(new NextRequest("http://localhost/api/health", { method: "GET" }));
    expect(publicRes.status).toBe(200);
  });

  it("Schritt 3: leitet unauthentifizierte Seiten-Aufrufe auf /login?from=... um und gibt bei API 401", async () => {
    const pageRes = await proxy(new NextRequest("http://localhost/security-dashboard"));
    expect(pageRes.status).toBe(307);
    expect(pageRes.headers.get("location")).toBe("http://localhost/login?from=%2Fsecurity-dashboard");

    const apiRes = await proxy(new NextRequest("http://localhost/api/security/snapshot"));
    expect(apiRes.status).toBe(401);
  });

  it("Schritt 4 & 5: prüft Capabilities (403 bei fehlendem Recht) und überschreibt gespoofte x-user-* Header", async () => {
    const ua = "Mozilla/5.0 Chrome/122.0";
    upsertSessionAccount({
      id: "u-berater",
      name: "Echter Berater",
      email: "berater@pycie.com",
      role: "berater",
      permissions: ["team:backoffice"],
    });
    const reqInit = new Request("http://localhost/api/session", { headers: { "user-agent": ua } });
    const sitzung = await Sitzungswachdienst.erstelleSitzung("u-berater", "Echter Berater", 3600, reqInit);
    const token = createSessionToken({
      id: "u-berater",
      version: 1,
      sessionId: sitzung.id,
      tokenId: sitzung.aktivesTokenId,
    });
    const cookie = `${VF_SESSION_COOKIE}=${encodeURIComponent(token)}`;

    // Berater ohne admin:security bekommt auf /api/security/snapshot 403
    const forbiddenApi = await proxy(
      new NextRequest("http://localhost/api/security/snapshot", {
        headers: { "user-agent": ua, cookie },
      }),
    );
    expect(forbiddenApi.status).toBe(403);

    // Berater mit Sonder-Capability team:backoffice darf /team-backoffice aufrufen; Spoofing-Header werden bereinigt
    const allowedReq = new NextRequest("http://localhost/team-backoffice", {
      headers: {
        "user-agent": ua,
        cookie,
        "x-user-id": "gespoofter-admin",
        "x-user-name": "Fake Admin",
        "x-user-permissions": "*",
      },
    });
    const allowedRes = await proxy(allowedReq);
    expect(allowedRes.status).toBe(200);
    expect(allowedRes.headers.get("x-middleware-override-headers")).toContain("x-user-id");
    expect(allowedRes.headers.get("x-middleware-request-x-user-id")).toBe("u-berater");
    expect(allowedRes.headers.get("x-middleware-request-x-user-name")).toBe("Echter Berater");
    expect(allowedRes.headers.get("x-middleware-request-x-user-permissions")).toContain("team:backoffice");
    expect(allowedRes.headers.get("x-middleware-request-x-user-permissions")).not.toBe("*");
  });
});
