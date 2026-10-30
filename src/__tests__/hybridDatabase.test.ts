import { beforeEach, describe, expect, it } from "vitest";
import { isSealed, seal, sealJson, unseal, unsealJson } from "../lib/dataCipher";
import { loeseLoginPoW } from "../lib/sicherheit/botSchutzClient";
import { hashePasswort, pruefePasswort } from "../lib/sicherheit/passwortHash";
import { AbrechnungDatabaseService } from "../services/AbrechnungDatabaseService";
import { AuthDatabaseService } from "../services/AuthDatabaseService";
import { BattleAndContestsDatabaseService } from "../services/BattleAndContestsDatabaseService";
import { ConsentDatabaseService } from "../services/ConsentDatabaseService";
import { DoorsAndCrmDatabaseService } from "../services/DoorsAndCrmDatabaseService";
import { LogbookDatabaseService } from "../services/LogbookDatabaseService";
import { SecurityDashboardDatabaseService } from "../services/SecurityDashboardDatabaseService";
import { LoginBackoffService } from "../services/sicherheit/LoginBackoffService";
import { resetKontenFuerTests } from "../services/sicherheit/SessionUserService";
import { Sitzungswachdienst } from "../services/sicherheit/Sitzungswachdienst";
import { clearMemoryStores } from "../services/store/MemoryRecordStore";
import { SqlDoorsRepo } from "../services/store/sqlDoorsRepo";
import { SqlSalesRepo } from "../services/store/sqlSalesRepo";
import { SqlTeamsRepo } from "../services/store/sqlTeamsRepo";
import { SqlUsersRepo } from "../services/store/sqlUsersRepo";
import { TariffAndCopilotDatabaseService } from "../services/TariffAndCopilotDatabaseService";
import { TeamOrgDatabaseService } from "../services/TeamOrgDatabaseService";

describe("Hybrid Database & DSGVO Verschlüsselung (Phasen 1–4)", () => {
  beforeEach(() => {
    clearMemoryStores();
    resetKontenFuerTests();
    Sitzungswachdienst.resetFuerTests();
    LoginBackoffService.resetFuerTests();
  });

  it("Phase 1: verschlüsselt Payloads & PII-Felder mit AES-256-GCM (dataCipher) und hasht Passwörter mit scrypt+Pepper", () => {
    const secret = "super-secret-dsgvo-key-2026";
    const sealed = seal("Geheimer Kundenvertrag Max Mustermann", secret);
    expect(isSealed(sealed)).toBe(true);
    expect(unseal(sealed, secret)).toBe("Geheimer Kundenvertrag Max Mustermann");

    const encryptedColumn = sealJson({ iban: "DE89370400440532013000", phone: "+49170123456" }, secret);
    expect(encryptedColumn).not.toContain("DE89370400440532013000");
    const decrypted = unsealJson<{ iban: string; phone: string }>(encryptedColumn, secret, { iban: "", phone: "" });
    expect(decrypted.iban).toBe("DE89370400440532013000");

    const pwHash = hashePasswort("StarkesPasswort!2026");
    expect(pwHash).toMatch(/^scrypt\$v1\$/);
    expect(pruefePasswort("StarkesPasswort!2026", pwHash)).toBe(true);
    expect(pruefePasswort("FalschesPasswort", pwHash)).toBe(false);
  });

  it("Phase 1: registriert neue Berater, prüft Login mit PoW und speichert DSGVO-Einwilligungen mit IP-Kürzung", async () => {
    const req = new Request("http://localhost:3001/api/auth/complete-registration", {
      headers: {
        "user-agent": "Mozilla/5.0 Chrome/124.0",
        "x-forwarded-for": "192.168.178.45",
      },
    });

    const reg = await AuthDatabaseService.completeRegistration(req, {
      email: "Berat.er+1@googlemail.com",
      name: "Tim Berater",
      vpkn: "VF-9911",
      password: "MeinPasswort2026!",
    });
    expect(reg.ok).toBe(true);
    if (!reg.ok) return;
    expect(reg.user.name).toBe("Tim Berater");
    expect(reg.setCookie).toContain("vf_session=");

    const pow = await loeseLoginPoW();
    const loginRes = await AuthDatabaseService.login(req, {
      email: "berater@gmail.com",
      password: "MeinPasswort2026!",
      powTs: pow.powTs,
      powNonce: pow.powNonce,
      honeypot: "",
    });
    expect(loginRes.ok).toBe(true);

    const consent = await ConsentDatabaseService.recordConsent(
      req,
      { analytics: true, externalMedia: false, version: 2 },
      reg.user.id,
    );
    expect(consent.ipKuerzel).toBe("192.168.178.0");
    expect((await ConsentDatabaseService.listConsents()).length).toBe(1);
  });

  it("Phase 2: verwaltet Teams, Mitglieder-Patches, Team-Onboarding und Lizenzen", async () => {
    const req = new Request("http://localhost:3001/api/auth/onboard-team", {
      headers: { "user-agent": "Mozilla/5.0 Chrome/124.0" },
    });
    const onboarded = await TeamOrgDatabaseService.onboardTeam(req, {
      teamName: "Team Rheinland",
      licenseCount: 15,
      advisorCount: 15,
      advisorEmails: ["a@pycie.com", "b@pycie.com"],
      planId: "team-pro",
      name: "Julia Wagner",
      email: "julia@pycie.com",
      password: "TeamLeaderPassword!1",
    });

    expect(onboarded.team.name).toBe("Team Rheinland");
    expect(onboarded.user.role).toBe("teamleiter");

    const teams = await SqlTeamsRepo.listAll();
    expect(teams.some((t) => t.name === "Team Rheinland")).toBe(true);

    const patched = await TeamOrgDatabaseService.patchMember(onboarded.user.id, {
      dailyStatus: "im_gebiet",
      dailyAttendance: "pünktlich",
    });
    expect(patched?.dailyStatus).toBe("im_gebiet");

    const licenses = await TeamOrgDatabaseService.getTeamLicenses(onboarded.team.id);
    expect(licenses.licenseCount).toBe(15);
    expect(licenses.licensedEmails).toEqual(["a@pycie.com", "b@pycie.com"]);

    const userFromRepo = await SqlUsersRepo.getById(onboarded.user.id);
    expect(userFromRepo?.teamName).toBe("Team Rheinland");
  });

  it("Phase 3: speichert und aktualisiert Haustüren (vf_doors), Straßen-Zuweisungen und CRM-Verkäufe (vf_sales)", async () => {
    await DoorsAndCrmDatabaseService.upsertDoorsBulk(
      [
        {
          id: "door-101",
          street: "Königsallee",
          houseNumber: "14",
          zipCode: "40212",
          city: "Düsseldorf",
          latitude: 51.224,
          longitude: 6.778,
          status: "Angetroffen → Termin",
          customerName: "Familie Schmidt",
        },
      ],
      "u-1",
      "Emre",
      "team-alpha",
    );

    const doors = await DoorsAndCrmDatabaseService.listDoors({ userId: "u-1" });
    expect(doors).toHaveLength(1);
    expect(doors[0]?.street).toBe("Königsallee");

    await DoorsAndCrmDatabaseService.assignStreet("u-2", "Königsallee", "40212", "Düsseldorf");
    const reassigned = await SqlDoorsRepo.getById("door-101");
    expect(reassigned?.userId).toBe("u-2");

    await DoorsAndCrmDatabaseService.upsertProductsBulk(
      [
        {
          id: "sale-501",
          doorId: "door-101",
          category: "telco",
          productName: "GigaZuhause 250 Kabel",
          commissionEuro: 145,
          status: "pending",
        },
      ],
      "u-2",
      "team-alpha",
    );

    await DoorsAndCrmDatabaseService.setSaleStatus("sale-501", "completed");
    const sale = await SqlSalesRepo.getById("sale-501");
    expect(sale?.status).toBe("completed");
    expect(sale?.commissionCents).toBe(14500);
  });

  it("Phase 4: synchronisiert Abrechnungen, Fahrtenbuch (mit Revisions-Schutz), Battle, Copilot & Security-Dashboard", async () => {
    // 1. Abrechnung
    const upload = await AbrechnungDatabaseService.upload("u-1", "vodafone", 9, 2026, "abrechnung-okt.xlsx", 2400);
    expect(upload.record.month).toBe(9);
    expect(upload.parsedItemCount).toBeGreaterThan(0);

    // 2. Logbook mit optimistischer Sperre (baseRev)
    const monthPut = await LogbookDatabaseService.putMonth("u-1", "2026-10", {
      baseRev: 0,
      trips: [],
      lock: null,
    });
    expect(monthPut.ok).toBe(true);
    if (monthPut.ok) {
      expect(monthPut.data.rev).toBe(1);
    }
    const conflictPut = await LogbookDatabaseService.putMonth("u-1", "2026-10", {
      baseRev: 0,
      trips: [],
      lock: null,
    });
    expect(conflictPut.ok).toBe(false);

    // 3. Battle & Contests
    const ch = await BattleAndContestsDatabaseService.createChallenge("u-1", "u-2");
    expect(ch.status).toBe("pending");
    const contests = await BattleAndContestsDatabaseService.listContests("telco");
    expect(contests.length).toBeGreaterThan(0);

    // 4. Copilot Memory
    await TariffAndCopilotDatabaseService.addMemory("u-1", "win", "3 Abschlüsse in einer Stunde", "user");
    const memories = await TariffAndCopilotDatabaseService.listMemories("u-1");
    expect(memories).toHaveLength(1);

    // 5. Security Dashboard
    await SecurityDashboardDatabaseService.blockIp("203.0.113.99", "Brute-Force Test", false);
    const bl = await SecurityDashboardDatabaseService.getBlacklist();
    expect(bl.blacklist.some((b) => b.ip === "203.0.113.99")).toBe(true);
  });
});
