import { describe, expect, it } from "vitest";
import { emailProblem, filterRows, lowestCount, monthlyCost, partnerState, replaceEmail, seatCounts, seatUsage, seatRows, seatState, withoutEmail } from "../lib/licenses/licenseLogic";
import { normalizeTeamLicenses } from "../lib/licenses/licenseNormalize";
import type { TeamLicenses } from "../lib/licenses/licenseTypes";

const v1Response = {
  teamId: "t1",
  teamName: "Team Nord",
  licensedEmails: ["A@x.de", "b@x.de", "c@x.de"],
  referredEmails: ["p@x.de"],
  licenseCount: 6,
  contractMinLicenses: 10,
  contractMinLicensesStartMonth: 3,
  subscriptionMonth: 2,
  contractBreached: false,
  referralCode: "NORD",
  subscription: { status: "active", currentPeriodEnd: "2026-11-01T00:00:00.000Z", stripeSubscriptionId: "sub_1" },
  members: [
    { email: "a@x.de", registered: true, name: "Anna", isActive: true, hasActiveSubscription: false },
    { email: "b@x.de", registered: true, name: "Ben", isActive: false, hasActiveSubscription: false },
  ],
  referredMembers: [{ email: "p@x.de", registered: true, name: "Pia", isActive: true, hasActiveSubscription: true }],
  affiliate: { rate: 0, tierName: "Visit Flow Partner", discountFormatted: "0%" },
};

const data = normalizeTeamLicenses(v1Response) as TeamLicenses;

describe("Team-Lizenzen: v1-Antwort lesen", () => {
  it("übernimmt Plätze, E-Mails klein, Status, Abbuchung und Sondertarif", () => {
    expect(data.licenseCount).toBe(6);
    expect(data.licensedEmails).toEqual(["a@x.de", "b@x.de", "c@x.de"]);
    expect(data.status).toBe("active");
    expect(data.renewsAt).toBe("2026-11-01T00:00:00.000Z");
    expect(data.contract).toEqual({ minLicenses: 10, startMonth: 3, currentMonth: 2, breached: false });
    expect(data.minLicenses).toBe(5);
  });

  it("lässt eine Überbelegung sichtbar und erkennt sie", () => {
    const over = normalizeTeamLicenses({ ...v1Response, licenseCount: 1 }) as TeamLicenses;
    expect(over.licenseCount).toBe(1);
    expect(seatUsage(over)).toMatchObject({ used: 3, total: 1, free: 0, over: 2, tone: "amber" });
    expect(seatUsage({ ...data, licenseCount: 3 })).toMatchObject({ free: 0, over: 0, share: 1, tone: "green" });
    expect(seatUsage(data)).toMatchObject({ used: 3, total: 6, free: 3, share: 0.5, tone: "red" });
    expect(normalizeTeamLicenses("kaputt")).toBeNull();
  });
});

describe("Team-Lizenzen: Plätze und Filter", () => {
  const rows = seatRows(data);

  it("ordnet Stand zu: aktiv, inaktiv, eingeladen, frei", () => {
    expect(rows.map((r) => (r.kind === "free" ? "free" : r.state))).toEqual(["active", "inactive", "pending", "free", "free", "free"]);
    expect(seatCounts(rows)).toEqual({ all: 6, active: 1, pending: 1, inactive: 1, free: 3 });
    expect(seatState(undefined)).toBe("pending");
    expect(partnerState(data.partners[0])).toBe("paying");
  });

  it("filtert nach Stand und sucht in Name und E-Mail", () => {
    expect(filterRows(rows, "free", "")).toHaveLength(3);
    expect(filterRows(rows, "all", "ben")).toEqual([expect.objectContaining({ email: "b@x.de" })]);
    expect(filterRows(rows, "all", "C@X")).toHaveLength(1);
  });

  it("prüft neue Adressen gegen Lizenzen und Partner", () => {
    expect(emailProblem("kein-mail", data)).toBe("invalid");
    expect(emailProblem(" A@X.de ", data)).toBe("licensed");
    expect(emailProblem("p@x.de", data)).toBe("partner");
    expect(emailProblem("a@x.de", data, "a@x.de")).toBeNull();
    expect(emailProblem("neu@x.de", data)).toBeNull();
  });

  it("rechnet 65 € je Lizenz und lässt nicht unter Minimum oder Vergebene", () => {
    expect(monthlyCost(10)).toBe(650);
    expect(lowestCount(data)).toBe(5);
    expect(lowestCount({ ...data, licensedEmails: ["1", "2", "3", "4", "5", "6", "7"] })).toBe(7);
    expect(withoutEmail(data.licensedEmails, "b@x.de")).toEqual(["a@x.de", "c@x.de"]);
    expect(replaceEmail(data.licensedEmails, "c@x.de", " Neu@X.de")).toEqual(["a@x.de", "b@x.de", "neu@x.de"]);
  });
});
