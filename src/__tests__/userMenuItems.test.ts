import { describe, expect, it } from "vitest";
import { buildUserMenu, hasAnyRole } from "../lib/navigation/userMenuItems";
import type { AuthUser } from "@/shared/auth/authSchemas";

const user = (role: string, extra: Partial<AuthUser> = {}): AuthUser => ({ id: "u1", email: "u@test.de", role, ...extra });
const ids = (u: AuthUser) => buildUserMenu(u).flatMap((group) => group.items.map((item) => item.id));
const groupIds = (u: AuthUser) => buildUserMenu(u).map((group) => group.id);

describe("Benutzermenü wie in v1", () => {
  it("zeigt dem Admin alle Admin-Punkte in der Reihenfolge von v1 und das Partnerprogramm", () => {
    expect(ids(user("admin"))).toEqual([
      "my-teams",
      "daily-status",
      "team-performance",
      "logbook",
      "security-dashboard",
      "admin-street-list",
      "admin-crm-overview",
      "team-backoffice",
      "expiring-contracts",
      "admin-dashboard",
      "team-licensing",
      "profile",
      "partner",
      "settings",
    ]);
  });

  it("führt Datenschutz nicht als eigenen Menüpunkt, sondern über die Einstellungen", () => {
    const items = buildUserMenu(user("admin")).flatMap((group) => group.items);
    expect(items.some((item) => item.href.includes("privacy"))).toBe(false);
    expect(items.find((item) => item.id === "settings")?.href).toBe("/settings");
  });

  it("gibt dem Teamleiter seine Kurzbefehle und keine Admin-Punkte", () => {
    expect(groupIds(user("teamleiter"))).toEqual(["status", "teamleiter", "account"]);
    expect(ids(user("teamleiter"))).not.toContain("admin-dashboard");
  });

  it("bietet Teamleitern das Team-Backoffice an, Beratern nicht", () => {
    expect(ids(user("teamleiter"))).toContain("team-backoffice");
    expect(ids(user("berater"))).not.toContain("team-backoffice");
  });

  it("zeigt die Team-Straßenliste auch bei Strukturleiter als Zusatzrolle und dann keine Mentor-Liste", () => {
    expect(groupIds(user("mentor", { roles: ["mentor", "strukturleiter"] }))).toEqual(["status", "strukturleiter", "account"]);
    expect(groupIds(user("mentor"))).toEqual(["status", "mentor", "account"]);
  });

  it("führt Führungskräfte zu Meine Teams, Berater nicht", () => {
    expect(ids(user("teamleiter"))[0]).toBe("my-teams");
    expect(ids(user("berater", { roles: ["mentor"] }))[0]).toBe("my-teams");
    expect(ids(user("berater"))).not.toContain("my-teams");
  });

  it("zeigt Beratern nur Status und Konto, das Partnerprogramm erst nach Freigabe", () => {
    expect(ids(user("berater"))).toEqual(["daily-status", "team-performance", "logbook", "profile", "settings"]);
    expect(ids(user("berater", { partnerStatus: "approved" }))).toContain("partner");
  });

  it("prüft Haupt- und Zusatzrollen", () => {
    expect(hasAnyRole(user("berater", { roles: ["mentor"] }), ["mentor"])).toBe(true);
    expect(hasAnyRole(user("berater", { roles: "mentor" }), ["mentor"])).toBe(false);
  });
});
