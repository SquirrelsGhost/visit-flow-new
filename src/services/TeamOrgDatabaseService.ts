import { randomUUID } from "node:crypto";
import type { SystemFlags } from "@/lib/admin/adminTypes";
import { permissionsForRole } from "@/lib/permissions";
import { DEMO_SUBSCRIPTION, demoInvoices } from "@/lib/profile/profileDemoData";
import { istWegwerfEmail, kanonischeEmail } from "@/lib/sicherheit/emailSchutz";
import { hashePasswort } from "@/lib/sicherheit/passwortHash";
import { demoPerformance } from "@/lib/team/performanceDemo";
import type { Vertical } from "@/lib/battle/battleCategories";
import { toAuthUser } from "./AuthDatabaseService";
import {
  buildSetSessionCookieHeader,
  createSessionToken,
  VF_SESSION_SECONDS,
} from "./sicherheit/SessionToken";
import {
  entsperreKonto,
  getSessionUser,
  sperreKonto,
  upsertSessionAccountAsync,
} from "./sicherheit/SessionUserService";
import { Sitzungswachdienst } from "./sicherheit/Sitzungswachdienst";
import type { StoredRecord } from "./store/RecordStore";
import { SqlDoorsRepo } from "./store/sqlDoorsRepo";
import { SqlSalesRepo } from "./store/sqlSalesRepo";
import { SqlTeamsRepo, type VfTeamRecord } from "./store/sqlTeamsRepo";
import { SqlUsersRepo, type VfUserRecord } from "./store/sqlUsersRepo";
import { createStore } from "./store/storeFactory";

export interface TeamLicenseRecord extends StoredRecord {
  id: string;
  teamId: string;
  licenseCount: number;
  licensedEmails: string[];
  partnerEmails: string[];
  planId: string;
  referralCode: string;
  receivedAt: string;
  updatedAt: string;
}

export interface SystemSettingsRecord extends StoredRecord, SystemFlags {}

const licenseStore = () => createStore<TeamLicenseRecord>("licenses");
const settingsStore = () => createStore<SystemSettingsRecord>("simulator-configs");

function toDirectoryUser(u: VfUserRecord) {
  const extra = (u.profilePii?.extra ?? {}) as Record<string, unknown>;
  return {
    id: u.id,
    _id: u.id,
    name: u.name,
    displayName: u.name,
    email: u.email,
    role: u.role,
    teamId: u.teamId,
    strukturleiterId: u.structureId,
    mentorId: u.mentorId,
    isActive: extra.isActive !== false,
    isBlocked: Boolean(u.gesperrtAm),
    blockReason: u.sperrGrund,
    battleInactive: extra.battleInactive === true,
    dailyStatus: typeof extra.dailyStatus === "string" ? extra.dailyStatus : undefined,
    dailyStatusReason: typeof extra.dailyStatusReason === "string" ? extra.dailyStatusReason : undefined,
    dailyStatusStartDate: typeof extra.dailyStatusStartDate === "string" ? extra.dailyStatusStartDate : undefined,
    dailyStatusEndDate: typeof extra.dailyStatusEndDate === "string" ? extra.dailyStatusEndDate : undefined,
    dailyStatusUpdatedAt: typeof extra.dailyStatusUpdatedAt === "string" ? extra.dailyStatusUpdatedAt : undefined,
    dailyAttendance: typeof extra.dailyAttendance === "string" ? extra.dailyAttendance : undefined,
    dailyAttendanceReason: typeof extra.dailyAttendanceReason === "string" ? extra.dailyAttendanceReason : undefined,
    dailyAttendanceMinutesLate:
      typeof extra.dailyAttendanceMinutesLate === "number" ? extra.dailyAttendanceMinutesLate : undefined,
    vodafoneContractStart: u.profilePii?.contractStart,
    createdAt: u.receivedAt,
    isRegularBerater: u.role === "berater",
  };
}

export class TeamOrgDatabaseService {
  static async listTeams() {
    const teams = await SqlTeamsRepo.listAll();
    if (teams.length === 0) {
      const now = new Date().toISOString();
      const seeded: VfTeamRecord = {
        id: "team-alpha",
        name: "Team Alpha",
        leaderId: "admin-1",
        leaderName: "Emre Ak",
        structureName: "Pycie Direktion",
        region: "Nordrhein-Westfalen",
        licenseLimit: 50,
        receivedAt: now,
        updatedAt: now,
      };
      await SqlTeamsRepo.upsert(seeded);
      return [{ id: seeded.id, _id: seeded.id, name: seeded.name, team_leader_id: seeded.leaderId }];
    }
    return teams.map((t) => ({
      id: t.id,
      _id: t.id,
      name: t.name,
      team_leader_id: t.leaderId,
      region: t.region,
      licenseLimit: t.licenseLimit,
    }));
  }

  static async listUsers(teamIdFilter?: string) {
    const all = await SqlUsersRepo.listAll();
    const filtered = teamIdFilter ? all.filter((u) => u.teamId === teamIdFilter) : all;
    return filtered.map(toDirectoryUser);
  }

  static async patchMember(userId: string, patch: Record<string, unknown>) {
    const existing = await SqlUsersRepo.getById(userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const role = typeof patch.role === "string" && patch.role ? patch.role : existing.role;
    const teamId =
      patch.teamId === null ? undefined : typeof patch.teamId === "string" ? patch.teamId : existing.teamId;
    const structureId =
      patch.strukturleiterId === null
        ? undefined
        : typeof patch.strukturleiterId === "string"
          ? patch.strukturleiterId
          : existing.structureId;
    const mentorId =
      patch.mentorId === null ? undefined : typeof patch.mentorId === "string" ? patch.mentorId : existing.mentorId;

    let gesperrtAm = existing.gesperrtAm;
    let sperrGrund = existing.sperrGrund;
    if (patch.isBlocked === true) {
      gesperrtAm = now;
      sperrGrund = typeof patch.blockReason === "string" ? patch.blockReason : "Vom Administrator gesperrt";
      await sperreKonto(existing.id, sperrGrund);
    } else if (patch.isBlocked === false) {
      gesperrtAm = undefined;
      sperrGrund = undefined;
      await entsperreKonto(existing.id);
    }

    const prevExtra = (existing.profilePii?.extra ?? {}) as Record<string, unknown>;
    const nextExtra: Record<string, unknown> = { ...prevExtra };
    const extraKeys = [
      "isActive",
      "battleInactive",
      "dailyStatus",
      "dailyStatusReason",
      "dailyStatusStartDate",
      "dailyStatusEndDate",
      "dailyStatusUpdatedAt",
      "dailyAttendance",
      "dailyAttendanceReason",
      "dailyAttendanceUpdatedAt",
      "dailyAttendanceMinutesLate",
    ];
    for (const k of extraKeys) {
      if (k in patch) {
        if (patch[k] === null) delete nextExtra[k];
        else nextExtra[k] = patch[k];
      }
    }

    const updated: VfUserRecord = {
      ...existing,
      role,
      roles: existing.roles.includes(role) ? existing.roles : [role, ...existing.roles],
      permissions: role !== existing.role ? permissionsForRole(role) : existing.permissions,
      teamId,
      structureId,
      mentorId,
      gesperrtAm,
      sperrGrund,
      profilePii: {
        ...existing.profilePii,
        extra: nextExtra,
      },
      updatedAt: now,
    };

    await SqlUsersRepo.upsert(updated);
    await upsertSessionAccountAsync({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      roles: updated.roles,
      teamId: updated.teamId,
      teamName: updated.teamName,
      permissions: updated.permissions,
      sitzungsVersion: updated.sitzungsVersion,
      gesperrtAm: updated.gesperrtAm ?? null,
      sperrGrund: updated.sperrGrund ?? null,
    });
    return toDirectoryUser(updated);
  }

  static async onboardTeam(
    req: Request,
    input: {
      teamName: string;
      licenseCount: number;
      advisorCount: number;
      advisorEmails: string[];
      planId: string;
      name: string;
      email: string;
      password: string;
    },
  ) {
    const emailClean = input.email.trim().toLowerCase();
    if (!emailClean || !emailClean.includes("@")) {
      throw new Error("Bitte eine gültige E-Mail-Adresse eingeben.");
    }
    if (istWegwerfEmail(emailClean)) {
      throw new Error("Wegwerf-E-Mail-Adressen sind nicht erlaubt.");
    }

    const sessionUser = await getSessionUser(req).catch(() => null);
    const existingUser = await SqlUsersRepo.getByEmail(emailClean);
    if (existingUser && existingUser.id !== sessionUser?.id) {
      throw new Error("Für diese E-Mail-Adresse existiert bereits ein Konto.");
    }

    const now = new Date().toISOString();
    const teamId = `team-${randomUUID().slice(0, 8)}`;
    const userId = existingUser?.id ?? `u-${randomUUID().slice(0, 10)}`;
    const referralCode = `VF-${teamId.slice(-4).toUpperCase()}`;
    const inviteLink = `https://visitflow.de/register?team=${teamId}&ref=${referralCode}`;

    await SqlTeamsRepo.upsert({
      id: teamId,
      name: input.teamName.trim(),
      leaderId: userId,
      leaderName: input.name.trim(),
      licenseLimit: Math.max(1, Number(input.licenseCount) || 5),
      memberIds: [userId],
      extra: {
        advisorEmails: input.advisorEmails,
        planId: input.planId,
        referralCode,
        inviteLink,
      },
      receivedAt: now,
      updatedAt: now,
    });

    await licenseStore().upsert({
      id: teamId,
      teamId,
      licenseCount: Math.max(1, Number(input.licenseCount) || 5),
      licensedEmails: input.advisorEmails ?? [],
      partnerEmails: [],
      planId: input.planId || "team-pro",
      referralCode,
      receivedAt: now,
      updatedAt: now,
    });

    const userRecord: VfUserRecord = {
      id: userId,
      emailCanonical: kanonischeEmail(input.email),
      email: input.email.trim().toLowerCase(),
      passwordHash: hashePasswort(input.password),
      name: input.name.trim(),
      role: "teamleiter",
      roles: ["teamleiter", "berater"],
      permissions: permissionsForRole("teamleiter"),
      teamId,
      teamName: input.teamName.trim(),
      sitzungsVersion: 1,
      identStatus: "pending",
      receivedAt: now,
      updatedAt: now,
    };

    await SqlUsersRepo.upsert(userRecord);
    await upsertSessionAccountAsync({
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      roles: userRecord.roles,
      teamId: userRecord.teamId,
      teamName: userRecord.teamName,
      permissions: userRecord.permissions,
      sitzungsVersion: 1,
      passwordHash: userRecord.passwordHash,
    });

    const sitzung = await Sitzungswachdienst.erstelleSitzung(userRecord.id, userRecord.name, VF_SESSION_SECONDS, req);
    const token = createSessionToken({
      id: userRecord.id,
      version: 1,
      sessionId: sitzung.id,
      tokenId: sitzung.aktivesTokenId,
    });

    return {
      user: toAuthUser(userRecord),
      token,
      stripeCheckoutUrl: null,
      team: {
        id: teamId,
        name: input.teamName.trim(),
        advisorCount: input.advisorCount || input.licenseCount || 5,
        advisorEmails: input.advisorEmails ?? [],
        licenseCount: input.licenseCount || 5,
        planId: input.planId || "team-pro",
        referralCode,
        inviteLink,
      },
      setCookie: buildSetSessionCookieHeader(token),
    };
  }

  static async getTeamLicenses(teamId = "team-alpha") {
    const existing = await licenseStore().get(teamId);
    if (existing) {
      return {
        teamId: existing.teamId,
        teamName: "Team Alpha",
        licenseCount: existing.licenseCount,
        licensedEmails: existing.licensedEmails,
        partnerEmails: existing.partnerEmails,
        referralCode: existing.referralCode,
        pricePerLicenseEur: 29,
      };
    }
    const now = new Date().toISOString();
    const seeded: TeamLicenseRecord = {
      id: teamId,
      teamId,
      licenseCount: 10,
      licensedEmails: ["lena.becker@pycie.com", "max.krueger@pycie.com"],
      partnerEmails: ["sara.yilmaz@pycie.com"],
      planId: "team-pro",
      referralCode: "VF-ALPHA",
      receivedAt: now,
      updatedAt: now,
    };
    await licenseStore().upsert(seeded);
    return {
      teamId: seeded.teamId,
      teamName: "Team Alpha",
      licenseCount: seeded.licenseCount,
      licensedEmails: seeded.licensedEmails,
      partnerEmails: seeded.partnerEmails,
      referralCode: seeded.referralCode,
      pricePerLicenseEur: 29,
    };
  }

  static async updateTeamLicenses(teamId: string, licenseCount: number, emails: string[]) {
    const current = await TeamOrgDatabaseService.getTeamLicenses(teamId);
    const now = new Date().toISOString();
    await licenseStore().upsert({
      id: teamId,
      teamId,
      licenseCount: Math.max(1, licenseCount),
      licensedEmails: emails,
      partnerEmails: current.partnerEmails,
      planId: "team-pro",
      referralCode: current.referralCode,
      receivedAt: now,
      updatedAt: now,
    });
    return { updated: true };
  }

  static async updatePartnerEmails(teamId: string, emails: string[]) {
    const current = await TeamOrgDatabaseService.getTeamLicenses(teamId);
    const now = new Date().toISOString();
    await licenseStore().upsert({
      id: teamId,
      teamId,
      licenseCount: current.licenseCount,
      licensedEmails: current.licensedEmails,
      partnerEmails: emails,
      planId: "team-pro",
      referralCode: current.referralCode,
      receivedAt: now,
      updatedAt: now,
    });
    return { updated: true };
  }

  static async getPerformanceHistory(days: number, vertical: Vertical) {
    return demoPerformance(days, vertical);
  }

  static async getSystemSettings(): Promise<SystemFlags> {
    const saved = await settingsStore().get("system-flags");
    return {
      maintenanceMode: saved?.maintenanceMode ?? false,
      allowRegistration: saved?.allowRegistration ?? true,
      bypassCompanyEmailRequirement: saved?.bypassCompanyEmailRequirement ?? false,
    };
  }

  static async saveSystemSettings(patch: Partial<SystemFlags>): Promise<SystemFlags> {
    const current = await TeamOrgDatabaseService.getSystemSettings();
    const next: SystemSettingsRecord = {
      id: "system-flags",
      receivedAt: new Date().toISOString(),
      maintenanceMode: patch.maintenanceMode ?? current.maintenanceMode,
      allowRegistration: patch.allowRegistration ?? current.allowRegistration,
      bypassCompanyEmailRequirement: patch.bypassCompanyEmailRequirement ?? current.bypassCompanyEmailRequirement,
    };
    await settingsStore().upsert(next);
    return {
      maintenanceMode: next.maintenanceMode,
      allowRegistration: next.allowRegistration,
      bypassCompanyEmailRequirement: next.bypassCompanyEmailRequirement,
    };
  }

  static async getAdminRevenueStats() {
    const licenses = await licenseStore().list();
    const totalLicenses = licenses.reduce((acc, l) => acc + (l.licenseCount || 0), 0) || 12;
    return {
      monthlyRecurringRevenueEur: totalLicenses * 29,
      totalActiveSubscriptions: Math.max(1, licenses.length),
      totalCanceledSubscriptions: 0,
      monthlyLostRevenueEur: 0,
      details: licenses.map((l) => ({
        teamId: l.teamId,
        licenseCount: l.licenseCount,
        contractBreached: false,
      })),
    };
  }

  static async getAdminActivity(startDate?: string, endDate?: string) {
    const [sales, doors] = await Promise.all([SqlSalesRepo.listAll(), SqlDoorsRepo.listAll()]);
    const inRange = (iso: string) => {
      const day = iso.slice(0, 10);
      if (startDate && day < startDate) return false;
      if (endDate && day > endDate) return false;
      return true;
    };
    return {
      products: sales
        .filter((s) => inRange(s.receivedAt))
        .map((s) => ({
          id: s.id,
          doorId: s.doorId ?? "",
          userId: s.userId,
          category: s.category,
          type: s.productName,
          timestamp: s.receivedAt,
          commission_euro: s.commissionCents / 100,
          notes: String(s.customerData?.notes ?? ""),
        })),
      doors: doors
        .filter((d) => inRange(d.receivedAt))
        .map((d) => ({
          id: d.id,
          userId: d.userId,
          timestamp: d.receivedAt,
          status: d.status,
        })),
    };
  }

  static getSubscription() {
    return DEMO_SUBSCRIPTION;
  }

  static getInvoices() {
    return demoInvoices();
  }
}
