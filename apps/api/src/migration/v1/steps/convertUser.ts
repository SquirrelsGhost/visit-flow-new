import { isRole, type Role } from "@visit-flow/shared/roles";
import { WHITELIST_STATES, type NewUserRow } from "../../../modules/users/User.model";
import { DEFAULTS, PASSTHROUGH } from "../../../modules/users/userView";
import { idOf, objectIdDate, toDate, toJson, toText } from "../convert";
import type { MigrationReport } from "../report";
import type { V1Doc } from "../source";

const COLUMN_KEYS = new Set([
  "email", "name", "role", "roles", "isActive", "isBlocked", "strukturleiterId", "mentorId", "teamId",
  "lockedUntil", "vodafoneContractStart", "giftedUntil", "createdAt", "updatedAt",
]);

/**
 * v1-Profilfelder ohne eigene Spalte. Bewusst nicht übernommen: lastIpAddress, userAgent und
 * deviceIds (Datensparsamkeit). stripeCustomerId bleibt in v1, bis das Abrechnungsmodul portiert ist.
 */
export const PROFILE_KEYS = [...new Set([...PASSTHROUGH, ...Object.keys(DEFAULTS)])].filter((key) => !COLUMN_KEYS.has(key));

export interface ConvertedUser {
  row: NewUserRow;
  refs: { teamId: string | null; mentorId: string | null; strukturleiterId: string | null };
}

const isWhitelistStatus = (value: unknown): value is (typeof WHITELIST_STATES)[number] =>
  typeof value === "string" && (WHITELIST_STATES as readonly string[]).includes(value);

/** Wandelt ein v1-Nutzerdokument um. null, wenn ID oder E-Mail fehlen. */
export function convertUser(doc: V1Doc, report: MigrationReport, now: Date): ConvertedUser | null {
  const id = idOf(doc._id);
  const email = typeof doc.email === "string" ? doc.email.trim().toLowerCase() : "";
  if (!id || !email) {
    report.warn("Nutzer ohne ID oder E-Mail übersprungen", id ?? "?");
    return null;
  }
  let role: Role = "berater";
  if (isRole(doc.role)) role = doc.role;
  else report.warn("Unbekannte Rolle, als berater übernommen", id);

  const profile: Record<string, unknown> = {};
  for (const key of PROFILE_KEYS) if (doc[key] !== undefined) profile[key] = toJson(doc[key]);
  const legacyId = idOf(doc.id);
  const createdAt = toDate(doc.createdAt) ?? objectIdDate(id) ?? now;

  return {
    row: {
      id,
      legacyId: legacyId && legacyId !== id ? legacyId : null,
      email,
      passwordHash: toText(doc.password),
      name: toText(doc.name) ?? email.split("@")[0] ?? email,
      role,
      roles: Array.isArray(doc.roles) ? [...new Set(doc.roles.filter(isRole))] : [],
      isActive: doc.isActive !== false,
      isBlocked: doc.isBlocked === true,
      blockedAt: toDate(doc.blockedAt),
      blockUntil: toDate(doc.blockUntil),
      blockReason: toText(doc.blockReason),
      isWhitelisted: doc.isWhitelisted === true,
      whitelistStatus: isWhitelistStatus(doc.whitelistStatus) ? doc.whitelistStatus : null,
      paymentRequired: doc.paymentRequired === true,
      giftedUntil: toDate(doc.giftedUntil),
      vodafoneContractStart: toDate(doc.vodafoneContractStart),
      loginAttempts: typeof doc.loginAttempts === "number" ? doc.loginAttempts : 0,
      lockedUntil: toDate(doc.lockedUntil),
      lastActivity: toDate(doc.lastActivity),
      profile,
      createdAt,
      updatedAt: toDate(doc.updatedAt) ?? createdAt,
    },
    refs: { teamId: idOf(doc.teamId), mentorId: idOf(doc.mentorId), strukturleiterId: idOf(doc.strukturleiterId) },
  };
}
