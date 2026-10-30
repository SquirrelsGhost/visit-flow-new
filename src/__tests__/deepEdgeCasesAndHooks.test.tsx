// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { calculateSolar, autoOptimize, DEFAULT_SOLAR, type Orientation } from "@/lib/solar/solarCalc";
import {
  leadCommission,
  clampLeads,
  leadRoleFor,
  LEAD_LIMITS,
  BERATER_BASE_RATE,
  BERATER_BONUS_RATE,
} from "@/lib/simulator/leadCommission";
import { autopilot, energyAutopilot } from "@/lib/simulator/telcoAutopilot";
import { DEMO_TARIFFS } from "@/lib/simulator/simulatorDemo";
import { isSealed, type SealedPayload } from "@/lib/dataCipher";
import type { TariffsByCategory } from "@/lib/simulator/simulatorTypes";
import { FileRecordStore, clearFileRecordCache } from "@/services/store/FileRecordStore";
import type { StoredRecord } from "@/services/store/RecordStore";
import {
  validateName,
  validateEmail,
  validatePasswordConfirmation,
  isCompanyEmail,
  cleanCode,
  CODE_LENGTH,
} from "@/lib/register/registerValidation";
import { checkPassword } from "@/lib/register/passwordStrength";
import { canProceed } from "@/lib/register/canProceed";
import { stepsFor, stepIndex } from "@/lib/register/registerSteps";
import { setDemoSession, hasDemoSession } from "@/lib/auth/demoSession";
import * as abrechnungApi from "@/lib/abrechnung/abrechnungApi";
import * as crmApi from "@/lib/crm/crmApi";
import * as backofficeApi from "@/lib/backoffice/backofficeApi";
import * as securityApi from "@/lib/security/securityApi";
import * as licenseApi from "@/lib/licenses/licenseApi";
import * as streetApi from "@/lib/streets/streetApi";
import * as tariffApi from "@/lib/tariff/tariffApi";
import TranslationProvider from "@/components/i18n/TranslationProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { DE } from "@/translations/de/de";
import { EN } from "@/translations/en/en";
import type { IMetaTags } from "@/services/MetaTagService";

describe("1. Math & Simulator Boundary Edge Cases", () => {
  describe("calculateSolar & autoOptimize", () => {
    it("handles negative batteryKwh without producing NaN", () => {
      const res = calculateSolar({ ...DEFAULT_SOLAR, batteryKwh: -10 });
      for (const [key, val] of Object.entries(res)) {
        expect(Number.isNaN(val), `Field ${key} should not be NaN`).toBe(false);
        expect(Number.isFinite(val), `Field ${key} should be finite`).toBe(true);
      }
      const resZero = calculateSolar({ ...DEFAULT_SOLAR, batteryKwh: 0 });
      expect(res.autarkyPercent).toBe(resZero.autarkyPercent);
    });

    it("handles batteryKwh = 0 (base autarky without battery boost)", () => {
      const res = calculateSolar({ ...DEFAULT_SOLAR, batteryKwh: 0 });
      expect(res.autarkyPercent).toBeGreaterThan(0);
      expect(res.autarkyPercent).toBeLessThanOrEqual(38);
    });

    it("sets altMonthlyIn20Years === altMonthlyCost when inflation = 0", () => {
      const res = calculateSolar({ ...DEFAULT_SOLAR, inflation: 0 });
      expect(res.altMonthlyIn20Years).toBe(res.altMonthlyCost);
      expect(res.totalAlt20Years).toBe(Math.round(DEFAULT_SOLAR.consumptionKwh * DEFAULT_SOLAR.electricityPrice * 20));
    });

    it("falls back to south orientation yield when orientation is unknown at runtime", () => {
      const unknownOrientation = "west-north-invalid" as unknown as Orientation;
      const resUnknown = calculateSolar({ ...DEFAULT_SOLAR, orientation: unknownOrientation });
      const resSouth = calculateSolar({ ...DEFAULT_SOLAR, orientation: "south" });
      expect(resUnknown.yearlyGenKwh).toBe(resSouth.yearlyGenKwh);
      expect(resUnknown.kWp).toBe(resSouth.kWp);
    });

    it("handles consumptionKwh = 0 and negative roofSqm gracefully without NaN or division by zero", () => {
      const resZeroConsumption = calculateSolar({
        ...DEFAULT_SOLAR,
        consumptionKwh: 0,
        roofSqm: -20,
      });
      expect(resZeroConsumption.maxPanels).toBe(1);
      expect(resZeroConsumption.kWp).toBeGreaterThan(0);
      expect(resZeroConsumption.autarkyPercent).toBe(30);
      expect(resZeroConsumption.selfConsumedKwh).toBe(0);
      expect(resZeroConsumption.altMonthlyCost).toBe(0);
      expect(Number.isNaN(resZeroConsumption.amortizationYears)).toBe(false);
    });

    it("autoOptimize clamps 0, negative, and huge consumption values within bounds", () => {
      expect(autoOptimize(0)).toEqual({ roofSqm: 15, batteryKwh: 0 });
      expect(autoOptimize(-500)).toEqual({ roofSqm: 15, batteryKwh: 0 });
      expect(autoOptimize(NaN)).toEqual({ roofSqm: 15, batteryKwh: 0 });
      expect(autoOptimize(4000)).toEqual({ roofSqm: 25, batteryKwh: 5 });
      expect(autoOptimize(500_000)).toEqual({ roofSqm: 150, batteryKwh: 20 });
    });
  });

  describe("leadCommission, clampLeads & leadRoleFor", () => {
    it("handles NaN, -Infinity, negative counts, and 0 safely", () => {
      for (const invalid of [NaN, -Infinity, -10, 0]) {
        const res = leadCommission("berater", invalid);
        expect(res.total).toBe(0);
        expect(res.bonusActive).toBe(false);
        expect(res.formula).toEqual({ kind: "berater", leads: 0, rate: BERATER_BASE_RATE });
      }
    });

    it("evaluates boundary tiers (1, 10, 25, 50, 99, 100) across all roles", () => {
      for (const n of [1, 10, 25, 50, 99]) {
        const berater = leadCommission("berater", n);
        expect(berater.total).toBe(n * BERATER_BASE_RATE);
        expect(berater.bonusActive).toBe(false);
      }
      const berater100 = leadCommission("berater", 100);
      expect(berater100.total).toBe(100 * BERATER_BONUS_RATE);
      expect(berater100.bonusActive).toBe(true);

      const ausbilder = leadCommission("ausbilder", 50);
      expect(ausbilder.total).toBe(100 * 100 + 50 * 10);
      expect(ausbilder.bonusActive).toBe(true);

      const teamleiter = leadCommission("teamleiter", 25);
      expect(teamleiter.total).toBe(75 * 100 + 25 * 20);
      expect(teamleiter.bonusActive).toBe(false);

      const partner = leadCommission("partner", 10);
      expect(partner.total).toBe(10 * 23);
      expect(partner.bonusActive).toBe(false);
    });

    it("clamps NaN, negative, and out-of-range values in clampLeads", () => {
      expect(clampLeads(NaN, LEAD_LIMITS.berater)).toBe(0);
      expect(clampLeads(NaN, LEAD_LIMITS.ausbilder)).toBe(400);
      expect(clampLeads(-50, LEAD_LIMITS.berater)).toBe(0);
      expect(clampLeads(9999, LEAD_LIMITS.berater)).toBe(400);
      expect(clampLeads(250.6, LEAD_LIMITS.berater)).toBe(251);
    });

    it("maps app roles to lead roles via leadRoleFor", () => {
      expect(leadRoleFor("mentor")).toBe("ausbilder");
      expect(leadRoleFor("strukturleiter")).toBe("teamleiter");
      expect(leadRoleFor("teamleiter")).toBe("partner");
      expect(leadRoleFor("gebietsmanager")).toBe("partner");
      expect(leadRoleFor("admin")).toBe("partner");
      expect(leadRoleFor("berater")).toBe("berater");
      expect(leadRoleFor(undefined)).toBe("berater");
    });
  });

  describe("autopilot & energyAutopilot", () => {
    it("returns empty basket when multiplier <= 0 or target <= 0 or all categories empty", () => {
      expect(autopilot(DEMO_TARIFFS, { target: 2000, month: 1, multiplier: 0, stornoOk: true })).toEqual([]);
      expect(autopilot(DEMO_TARIFFS, { target: 2000, month: 1, multiplier: -1, stornoOk: true })).toEqual([]);
      expect(autopilot(DEMO_TARIFFS, { target: 0, month: 1, multiplier: 1, stornoOk: true })).toEqual([]);
      expect(autopilot(DEMO_TARIFFS, { target: -500, month: 1, multiplier: 1, stornoOk: true })).toEqual([]);

      const emptyTariffs: TariffsByCategory = {};
      expect(autopilot(emptyTariffs, { target: 2000, month: 1, multiplier: 1, stornoOk: true })).toEqual([]);
    });

    it("converges on a positive target with standard product mix", () => {
      const basket = autopilot(DEMO_TARIFFS, { target: 1500, month: 3, multiplier: 1, stornoOk: true });
      expect(basket.length).toBeGreaterThan(0);
      const categories = basket.map((p) => p.category);
      expect(categories).toContain("Upsell");
      expect(categories).toContain("KIP");
    });

    it("handles energyAutopilot edge cases and normal convergence", () => {
      expect(energyAutopilot(DEMO_TARIFFS, 0)).toEqual([]);
      expect(energyAutopilot(DEMO_TARIFFS, -100)).toEqual([]);
      expect(energyAutopilot({}, 500)).toEqual([]);

      const energyBasket = energyAutopilot(DEMO_TARIFFS, 500);
      expect(energyBasket).toHaveLength(1);
      expect(energyBasket[0]!.quantity * energyBasket[0]!.commission).toBeGreaterThanOrEqual(500);
    });
  });
});

interface TestItem extends StoredRecord {
  id: string;
  receivedAt: string;
  label: string;
  count: number;
}

describe("2. FileRecordStore Encryption, Concurrency & .bak Self-Healing", () => {
  let tmpDir: string;
  const secret = "test-super-secret-aes-256-gcm-key-2026";

  beforeEach(async () => {
    clearFileRecordCache();
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "vf-store-test-"));
  });

  afterEach(async () => {
    clearFileRecordCache();
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("seals on-disk JSON with AES-256-GCM (vf:gcm:v1:...) and enforces secret on read", async () => {
    const filePath = path.join(tmpDir, "encrypted.json");
    const store = new FileRecordStore<TestItem>(filePath, secret);

    await store.insert((existingIds) => ({
      id: `item-${existingIds.length + 1}`,
      receivedAt: "2026-04-01T10:00:00.000Z",
      label: "Geheimer Datensatz",
      count: 42,
    }));

    const rawOnDisk = await readFile(filePath, "utf8");
    const parsedOnDisk = JSON.parse(rawOnDisk) as SealedPayload;
    expect(isSealed(parsedOnDisk)).toBe(true);
    expect(parsedOnDisk.sealed).toBe(1);
    expect(typeof parsedOnDisk.iv).toBe("string");
    expect(typeof parsedOnDisk.tag).toBe("string");
    expect(typeof parsedOnDisk.data).toBe("string");
    expect(rawOnDisk).not.toContain("Geheimer Datensatz");

    // Clear memory cache and verify reading from disk decrypts properly
    clearFileRecordCache();
    const loaded = await store.get("item-1");
    expect(loaded).toEqual({
      id: "item-1",
      receivedAt: "2026-04-01T10:00:00.000Z",
      label: "Geheimer Datensatz",
      count: 42,
    });

    // If secret is missing and .bak is also encrypted, store falls back to []
    clearFileRecordCache();
    const unauthenticatedStore = new FileRecordStore<TestItem>(filePath, "");
    expect(await unauthenticatedStore.list()).toEqual([]);
  });

  it("self-heals from .bak when primary .json file is corrupted with invalid bytes", async () => {
    const filePath = path.join(tmpDir, "selfheal.json");
    const store = new FileRecordStore<TestItem>(filePath, secret);

    await store.upsert({
      id: "rec-1",
      receivedAt: "2026-04-02T12:00:00.000Z",
      label: "Backup-Sicher",
      count: 7,
    });

    // Corrupt primary file with garbage bytes
    await writeFile(filePath, "{corrupted-json-bytes!!!", "utf8");
    clearFileRecordCache();

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const recoveredList = await store.list();
    expect(recoveredList).toHaveLength(1);
    expect(recoveredList[0]!.label).toBe("Backup-Sicher");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[Selbstheilung]"));
    warnSpy.mockRestore();

    // Primary file on disk should now be restored from .bak
    const healedRaw = await readFile(filePath, "utf8");
    expect(isSealed(JSON.parse(healedRaw))).toBe(true);
  });

  it("supports insert, update, removeWhere (delete/clear) and concurrent parallel upsert locking", async () => {
    const filePath = path.join(tmpDir, "concurrent.json");
    const store = new FileRecordStore<TestItem>(filePath, secret);

    // Parallel upserts to test exclusive queue serialization
    await Promise.all(
      Array.from({ length: 20 }, (_, idx) =>
        store.upsert({
          id: `p-${idx}`,
          receivedAt: new Date(2026, 3, 1, 0, idx).toISOString(),
          label: `Item ${idx}`,
          count: idx,
        }),
      ),
    );

    const all = await store.list();
    expect(all).toHaveLength(20);
    // Sorted by newest receivedAt first
    expect(all[0]!.id).toBe("p-19");
    expect(all[19]!.id).toBe("p-0");

    // Update existing and non-existent
    const updated = await store.update("p-5", (curr) => ({ ...curr, count: 500, label: "Updated 5" }));
    expect(updated?.count).toBe(500);
    expect(await store.update("non-existent", (curr) => curr)).toBeNull();

    // Delete specific items via removeWhere
    const removedCount = await store.removeWhere((r) => r.count >= 10 && r.count < 20);
    expect(removedCount).toBe(10);
    expect(await store.list()).toHaveLength(10);

    // Clear all items via removeWhere(() => true)
    const cleared = await store.removeWhere(() => true);
    expect(cleared).toBe(10);
    expect(await store.list()).toEqual([]);
  });
});

describe("3. Registration Validation, Password Strength & Wizard Steps", () => {
  it("validates names, emails (including disposable domain blocking), and company domain", () => {
    expect(validateName("   ")).toBe("Name ist erforderlich");
    expect(validateName("A")).toBe("Name muss mindestens 2 Zeichen lang sein");
    expect(validateName("A".repeat(51))).toBe("Name darf maximal 50 Zeichen lang sein");
    expect(validateName("Max")).toBe("Bitte geben Sie Vor- und Nachname ein (durch Leerzeichen getrennt)");
    expect(validateName("Max Mustermann")).toBeNull();

    expect(validateEmail("")).toBe("E-Mail-Adresse ist erforderlich");
    expect(validateEmail("not-an-email")).toBe("Bitte geben Sie eine gültige E-Mail-Adresse ein");
    expect(validateEmail("temp@mailinator.com")).toContain("Wegwerf-");
    expect(validateEmail("max.mustermann@example.de")).toBeNull();

    expect(isCompanyEmail("berater@vertriebspartner-vfkd.de")).toBe(true);
    expect(isCompanyEmail("  BERATER@VERTRIEBSPARTNER-VFKD.DE ")).toBe(true);
    expect(isCompanyEmail("berater@vodafone.de")).toBe(false);

    expect(cleanCode("ab12-34 5678")).toBe("123456");
    expect(cleanCode("99")).toHaveLength(2);
    expect(CODE_LENGTH).toBe(6);

    expect(validatePasswordConfirmation("Secret123!", "")).toBe("Passwort-Bestätigung ist erforderlich");
    expect(validatePasswordConfirmation("Secret123!", "Different123!")).toBe("Passwörter stimmen nicht überein");
    expect(validatePasswordConfirmation("Secret123!", "Secret123!")).toBeNull();
  });

  it("evaluates password strength and enforces canProceed across all 6 registration steps", () => {
    const weak = checkPassword("short");
    expect(weak.isValid).toBe(false);
    expect(weak.strength).toBe("weak");

    const strong = checkPassword("V!sitFl0w#2026_Secure");
    expect(strong.isValid).toBe(true);
    expect(strong.strength).toBe("excellent");

    const baseInput = {
      name: "Max Mustermann",
      email: "max@example.de",
      contractStart: "2026-05-01",
      verificationCode: "123456",
      secondaryEmail: "max@vertriebspartner-vfkd.de",
      secondaryVerificationCode: "654321",
      password: "V!sitFl0w#2026_Secure",
      confirmPassword: "V!sitFl0w#2026_Secure",
      passwordCheck: strong,
    };

    expect(canProceed("data", baseInput)).toBe(true);
    expect(canProceed("data", { ...baseInput, name: "SingleName" })).toBe(false);
    expect(canProceed("data", { ...baseInput, email: "trash@mailinator.com" })).toBe(false);

    expect(canProceed("team", baseInput)).toBe(true);
    expect(canProceed("team", { ...baseInput, contractStart: "" })).toBe(false);

    expect(canProceed("code", baseInput)).toBe(true);
    expect(canProceed("code", { ...baseInput, verificationCode: "12345" })).toBe(false);

    expect(canProceed("companyEmail", baseInput)).toBe(true);
    expect(canProceed("companyEmail", { ...baseInput, secondaryEmail: "max@example.de" })).toBe(false);

    expect(canProceed("companyCode", baseInput)).toBe(true);
    expect(canProceed("companyCode", { ...baseInput, secondaryVerificationCode: "12" })).toBe(false);

    expect(canProceed("password", baseInput)).toBe(true);
    expect(canProceed("password", { ...baseInput, confirmPassword: "Wrong" })).toBe(false);
    expect(canProceed("password", { ...baseInput, passwordCheck: weak })).toBe(false);

    // Step definitions & stepIndex
    expect(stepsFor("data", true)).toHaveLength(4);
    expect(stepsFor("team", false)).toHaveLength(4);
    const companySteps = stepsFor("team", true);
    expect(companySteps).toHaveLength(6);
    expect(stepIndex(companySteps, "companyEmail")).toBe(3);
    expect(stepIndex(stepsFor("team", false), "companyEmail")).toBe(0);
  });
});

describe("4. Real Non-Demo Client API Wrappers & TranslationProvider Cookie Sync", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    setDemoSession(false);
    expect(hasDemoSession()).toBe(false);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockJsonResponse = (body: unknown, status = 200) =>
    Promise.resolve({
      status,
      ok: status >= 200 && status < 300,
      json: async () => body,
    } as Response);

  it("calls real endpoints in abrechnungApi when hasDemoSession() is false", async () => {
    // Energy category short-circuits on live API
    expect(await abrechnungApi.loadMonth("energy", { month: 4, year: 2026 })).toBeNull();
    expect(await abrechnungApi.loadOpen("energy")).toEqual([]);
    expect(await abrechnungApi.loadHistory("energy")).toEqual([]);
    expect(await abrechnungApi.loadReklamationen("energy")).toEqual([]);

    // Vodafone live requests
    fetchMock.mockImplementationOnce(() =>
      mockJsonResponse({ success: true, data: { _id: "rec-1", month: 4, year: 2026 } }),
    );
    const monthRec = await abrechnungApi.loadMonth("vodafone", { month: 4, year: 2026 });
    expect(monthRec?._id).toBe("rec-1");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/abrechnung/4/2026?category=vodafone",
      expect.objectContaining({ credentials: "include" }),
    );

    // Error handling on loadMonth
    fetchMock.mockImplementationOnce(() => mockJsonResponse({ success: false, error: "Nicht gefunden" }, 404));
    await expect(abrechnungApi.loadMonth("vodafone", { month: 1, year: 2026 })).rejects.toThrow("Nicht gefunden");

    // runOnItems groups by recordId and counts failures
    fetchMock
      .mockImplementationOnce(() => mockJsonResponse({ success: true }))
      .mockImplementationOnce(() => mockJsonResponse({ success: false, error: "Server error" }, 500));

    const bulkRes = await abrechnungApi.runOnItems(
      "vodafone",
      [
        { _id: "i1", recordId: "r1", status: "missing_in_system" } as never,
        { _id: "i2", recordId: "r2", status: "missing_in_system" } as never,
      ],
      "fallback-r",
      { kind: "confirm" },
    );
    expect(bulkRes).toEqual({ failed: 1, total: 2 });
  });

  it("calls real endpoints in crmApi and backofficeApi when hasDemoSession() is false", async () => {
    fetchMock.mockImplementationOnce(() =>
      mockJsonResponse({ success: true, sales: [{ _id: "s1", productName: "GigaZuhause" }] }),
    );
    const sales = await crmApi.loadSales();
    expect(sales).toHaveLength(1);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/products/sales", expect.anything());

    fetchMock.mockImplementationOnce(() => mockJsonResponse({ success: true }));
    await crmApi.setStatus(["s1"], "completed");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/products/sales/s1/status",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "completed" }) }),
    );

    fetchMock.mockImplementationOnce(() => mockJsonResponse({ success: true }));
    await crmApi.discard(["s1"]);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/products/s1", expect.objectContaining({ method: "DELETE" }));

    // backofficeApi: 404 maps to SERVER_MISSING
    fetchMock.mockImplementationOnce(() => mockJsonResponse({ success: false, message: "Cannot PATCH" }, 404));
    await expect(backofficeApi.setSalesStatus(["s1"], "cancelled", "Kunde widerrufen")).rejects.toThrow(
      backofficeApi.SERVER_MISSING,
    );

    // backofficeApi: user without teamId throws
    await expect(
      backofficeApi.loadTeamSales({
        id: "u1",
        email: "tl@example.de",
        name: "TL",
        role: "teamleiter",
        permissions: ["team:*"],
      }),
    ).rejects.toThrow("Du bist noch keinem Team zugeordnet.");
  });

  it("calls real endpoints in securityApi, licenseApi, streetApi, and tariffApi", async () => {
    // securityApi.loadAudit with category and email query
    fetchMock
      .mockImplementationOnce(() =>
        mockJsonResponse({
          success: true,
          logs: [
            {
              _id: "a1",
              action: "LOGIN_FAILED",
              category: "auth",
              severity: "warning",
              actorEmail: "admin@visit-flow.de",
              timestamp: "2026-04-01T10:00:00Z",
            },
          ],
        }),
      )
      .mockImplementationOnce(() => mockJsonResponse({ success: true, count: 1 }));

    const audit = await securityApi.loadAudit({ category: "SECURITY", query: "admin@visit-flow.de" });
    expect(audit.total).toBe(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("category=SECURITY");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("actorEmail=admin%40visit-flow.de");

    // licenseApi.saveLicenses & openBillingPortal
    fetchMock.mockImplementationOnce(() => mockJsonResponse({ success: true }));
    expect(await licenseApi.saveLicenses(5, ["a@b.de"])).toEqual({ ok: true });

    fetchMock.mockImplementationOnce(() =>
      mockJsonResponse({ success: true, data: { url: "https://billing.stripe.com/session/123" } }),
    );
    expect(await licenseApi.openBillingPortal()).toEqual({
      ok: true,
      url: "https://billing.stripe.com/session/123",
    });

    // streetApi.deleteDoors treats "not found" as success
    fetchMock
      .mockImplementationOnce(() => mockJsonResponse({ success: true }))
      .mockImplementationOnce(() => mockJsonResponse({ success: false, error: "Door not found" }, 404));
    const delBatch = await streetApi.deleteDoors(["d1", "d2"]);
    expect(delBatch).toEqual({ ok: ["d1", "d2"], failed: 0 });

    // tariffApi.loadTariffs caches on success and falls back to cache on network failure
    const sampleTariffs = [{ id: "t1", name: "GigaZuhause 100", category: "kabel-neu" }];
    fetchMock.mockImplementationOnce(() => mockJsonResponse({ success: true, data: sampleTariffs }));
    expect(await tariffApi.loadTariffs("kabel-neu" as never)).toEqual(sampleTariffs);

    fetchMock.mockImplementationOnce(() => mockJsonResponse({ success: false, error: "Offline" }, 500));
    expect(await tariffApi.loadTariffs("kabel-neu" as never)).toEqual(sampleTariffs);
  });

  it("synchronizes MANUAL_NEXT_LOCALE cookie and document.documentElement.lang in TranslationProvider", () => {
    function LocaleConsumer() {
      const { language, setLanguage, t } = useTranslation();
      return (
        <div>
          <span data-testid="lang">{language}</span>
          <span data-testid="label">{t("register.step.data")}</span>
          <button type="button" onClick={() => setLanguage("en")}>
            Switch EN
          </button>
        </div>
      );
    }

    render(
      <TranslationProvider>
        <LocaleConsumer />
      </TranslationProvider>,
    );

    expect(screen.getByTestId("lang").textContent).toBe("de");
    expect(document.documentElement.lang).toBe("de");

    act(() => {
      fireEvent.click(screen.getByText("Switch EN"));
    });

    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.cookie).toContain("MANUAL_NEXT_LOCALE=en");
  });
});

describe("5. SEO & Translation Invariants (DE & EN)", () => {
  function collectMetaTags(root: unknown, prefix = ""): Array<{ key: string; meta: IMetaTags }> {
    const entries: Array<{ key: string; meta: IMetaTags }> = [];
    if (!root || typeof root !== "object") return entries;
    const obj = root as Record<string, unknown>;
    if (
      typeof obj.title === "string" &&
      typeof obj.description === "string" &&
      typeof obj.imgUrl === "string" &&
      Array.isArray(obj.tags) &&
      typeof obj.url === "string"
    ) {
      entries.push({ key: prefix, meta: obj as unknown as IMetaTags });
      return entries;
    }
    for (const [k, v] of Object.entries(obj)) {
      entries.push(...collectMetaTags(v, prefix ? `${prefix}.${k}` : k));
    }
    return entries;
  }

  it.each([
    ["DE", DE],
    ["EN", EN],
  ])("enforces strict SEO MetaTags invariants for all pages in %s", (_localeName, translation) => {
    const pages = collectMetaTags(translation);
    // 22 standard pages + 3 StreetListPage sub-variants = 25 MetaTags blocks
    expect(pages.length).toBeGreaterThanOrEqual(25);

    const keys = pages.map((p) => p.key);
    expect(keys).toContain("OnboardingPage.MetaTags");
    expect(keys).toContain("PrivacySettingsPage.MetaTags");
    expect(keys).toContain("StreetListPage.MetaTags.admin");
    expect(keys).toContain("StreetListPage.MetaTags.struktur");
    expect(keys).toContain("StreetListPage.MetaTags.mentor");

    for (const { key, meta } of pages) {
      expect(meta.title.trim().length, `${key} title must be non-empty`).toBeGreaterThan(0);
      expect(meta.url.startsWith("https://visit-flow.de"), `${key} url must start with https://visit-flow.de`).toBe(
        true,
      );
      expect(
        meta.imgUrl.startsWith("https://visit-flow.de/"),
        `${key} imgUrl must start with https://visit-flow.de/`,
      ).toBe(true);
      expect(meta.tags.length, `${key} must have at least 1 tag`).toBeGreaterThan(0);
      expect(
        meta.description.length,
        `${key} description length (${meta.description.length}) must be >= 140`,
      ).toBeGreaterThanOrEqual(140);
      expect(
        meta.description.length,
        `${key} description length (${meta.description.length}) must be <= 160`,
      ).toBeLessThanOrEqual(160);
    }
  });
});
