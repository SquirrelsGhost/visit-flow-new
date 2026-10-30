import { describe, expect, it } from "vitest";
import { pageTitleKey } from "../lib/navigation/pageTitles";

describe("Seitentitel in der Topbar", () => {
  it("nimmt den Namen aus Navigation, Menü und eigener Liste", () => {
    expect(pageTitleKey("/dashboard")).toBe("page.map");
    expect(pageTitleKey("/abrechnung")).toBe("page.abrechnung");
    expect(pageTitleKey("/battle")).toBe("nav.battle");
    expect(pageTitleKey("/statistics")).toBe("nav.statistics");
    expect(pageTitleKey("/pattern-analysis-demo")).toBe("nav.assistant");
    expect(pageTitleKey("/settings")).toBe("nav.settings");
    expect(pageTitleKey("/teamleiter-berichte")).toBe("header.teamleiterReports");
    expect(pageTitleKey("/teams")).toBe("nav.myTeams");
    expect(pageTitleKey("/admin-crm-overview")).toBe("page.crmOverview");
    expect(pageTitleKey("/expiring-contracts")).toBe("header.expiringContracts");
    expect(pageTitleKey("/security-dashboard")).toBe("nav.securityDashboard");
  });

  it("gilt auch für Unterseiten und Ziele mit Query", () => {
    expect(pageTitleKey("/battle/logs")).toBe("nav.battle");
    expect(pageTitleKey("/subscription")).toBe("header.teamLicensing");
  });

  it("fällt bei unbekannten Seiten auf den App-Namen zurück", () => {
    expect(pageTitleKey("/irgendwas")).toBe("app.title");
  });
});
