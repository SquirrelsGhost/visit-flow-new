import { describe, expect, it } from "vitest";
import { attendanceGroup, groupMembers, shortName, teamDaySummary, visibleMembers, whatsappText } from "../lib/team/attendance";
import { effectiveStatus, isOutOfBattles, upcomingStatus } from "../lib/team/dailyStatus";
import { draftOf } from "../lib/team/statusDraft";
import { attendancePatch, clampDraft, minStart, statusPatch } from "../lib/team/statusPayload";
import type { TeamMember } from "../lib/team/teamTypes";

const NOW = new Date(2026, 9, 23, 10, 0);
const iso = (d: number, h = 12) => new Date(2026, 9, d, h).toISOString();
const member = (id: string, extra: Partial<TeamMember> = {}): TeamMember => ({ id, name: `Person ${id}`, role: "berater", teamId: "t1", isActive: true, ...extra });

describe("Tagesstatus", () => {
  it("gilt nur im Zeitraum, sonst wieder Aktiv; Wakeup bleibt in den Battles", () => {
    const sick = member("a", { dailyStatus: "sick", dailyStatusStartDate: iso(22), dailyStatusEndDate: iso(24) });
    expect(effectiveStatus(sick, NOW)).toBe("sick");
    expect(isOutOfBattles(sick, NOW)).toBe(true);
    expect(effectiveStatus(sick, new Date(2026, 9, 26))).toBe("active");
    const wakeup = member("b", { dailyStatus: "wakeup_inactive", dailyStatusUpdatedAt: iso(23) });
    expect(effectiveStatus(wakeup, NOW)).toBe("wakeup_inactive");
    expect(isOutOfBattles(wakeup, NOW)).toBe(false);
  });

  it("erkennt geplanten Urlaub und füllt das Formular damit", () => {
    const later = member("c", { dailyStatus: "inactive", dailyStatusReason: "Urlaub", dailyStatusStartDate: iso(28), dailyStatusEndDate: iso(30) });
    expect(upcomingStatus(later, NOW)).toEqual({ status: "inactive", start: "2026-10-28", end: "2026-10-30" });
    expect(draftOf(later, NOW)).toEqual({ status: "inactive", reason: "Urlaub", start: "2026-10-28", end: "2026-10-30" });
    expect(draftOf(member("d", { dailyStatus: "sick", dailyStatusUpdatedAt: iso(20) }), NOW).status).toBe("active");
  });

  it("lässt Berater Urlaub erst ab morgen melden, Leitungen jederzeit", () => {
    expect(minStart("inactive", false, "2026-10-23")).toBe("2026-10-24");
    expect(minStart("sick", false, "2026-10-23")).toBeUndefined();
    expect(minStart("inactive", true, "2026-10-23")).toBeUndefined();
    expect(clampDraft({ status: "inactive", reason: "", start: "2026-10-23", end: "2026-10-22" }, false, "2026-10-23")).toMatchObject({ start: "2026-10-24", end: "2026-10-24" });
  });

  it("speichert wie v1: Zeitraum bis Tagesende, Krank durch die Leitung gleich entschuldigt", () => {
    const patch = statusPatch({ status: "sick", reason: "", start: "2026-10-23", end: "2026-10-24" }, true, NOW);
    expect(patch).toMatchObject({ dailyStatus: "sick", dailyAttendance: "excused", dailyAttendanceReason: "Krank" });
    expect(new Date(patch.dailyStatusEndDate as string).getHours()).toBe(23);
    expect(statusPatch({ status: "sick", reason: "", start: "2026-10-23", end: "2026-10-23" }, false, NOW).dailyAttendance).toBeUndefined();
    expect(statusPatch({ status: "active", reason: "x", start: "", end: "" }, false, NOW)).toMatchObject({ dailyStatusStartDate: null, dailyStatusReason: "" });
    expect(attendancePatch("late", "12", NOW)).toMatchObject({ dailyAttendance: "late", dailyAttendanceMinutesLate: 12 });
    expect(attendancePatch(null, undefined, NOW)).toMatchObject({ dailyAttendance: null, dailyAttendanceReason: null });
  });
});

describe("Anwesenheit", () => {
  const members = [
    member("1", { name: "Sarah Klein", dailyAttendance: "present", dailyAttendanceUpdatedAt: iso(23, 9) }),
    member("2", { name: "Noah Fischer", dailyStatus: "sick", dailyStatusStartDate: iso(23), dailyStatusEndDate: iso(23) }),
    member("3", { name: "Lea Schulz", dailyAttendance: "late", dailyAttendanceUpdatedAt: iso(22, 9) }),
    member("4", { name: "Tim Hoffmann", role: "teamleiter" }),
    member("5", { name: "Mia Becker", battleInactive: true }),
  ];

  it("ordnet wie v1: eigene Abmeldung ist offene Anfrage, gestriger Eintrag zählt nicht", () => {
    expect(attendanceGroup(members[1] as TeamMember, NOW)).toBe("pending");
    expect(attendanceGroup(members[2] as TeamMember, NOW)).toBe("open");
    const groups = groupMembers(members.slice(0, 3), NOW);
    expect(groups.present.map((m) => m.id)).toEqual(["1"]);
    expect(teamDaySummary(members.slice(0, 3), NOW)).toMatchObject({ total: 3, working: 2, sick: 1, todo: 2 });
  });

  it("zeigt Teamleitern ihr Team ohne andere Teamleiter und ohne Battle-Inaktive", () => {
    const viewer = { id: "tl", email: "x", role: "teamleiter", teamId: "t1" };
    expect(visibleMembers(viewer, members).map((m) => m.id)).toEqual(["1", "2", "3"]);
    expect(visibleMembers({ ...viewer, role: "admin" }, members).map((m) => m.id)).toContain("4");
  });

  it("baut die WhatsApp-Liste mit Kurznamen", () => {
    expect(shortName("Sarah Klein")).toBe("Sarah K.");
    const text = whatsappText(groupMembers(members.slice(0, 3), NOW), NOW);
    expect(text).toContain("*⚠️ Offene Anfragen (1)*\n- Noah F.");
    expect(text.indexOf("Anwesend")).toBeLessThan(text.indexOf("Noch zu bearbeiten"));
  });
});
