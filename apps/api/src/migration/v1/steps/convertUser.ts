import { isRole, type Role } from "@visit-flow/shared/roles";
import type { ApprovalStatus, NewUserRow } from "../../../modules/users/User.model";
import { idOf, objectIdDate, toDate, toText } from "../convert";
import type { UserRefs } from "../context";
import type { MigrationReport } from "../report";
import type { V1Doc } from "../source";

export interface ConvertedUser {
  v1Id: string;
  row: Omit<NewUserRow, "id">;
  refs: UserRefs;
}

function approval(doc: V1Doc): ApprovalStatus {
  if (doc.whitelistStatus === "rejected") return "rejected";
  return doc.isWhitelisted === true && doc.whitelistStatus === "approved" ? "approved" : "pending";
}

const version = (value: unknown) => (typeof value === "number" ? String(value) : toText(value));

/**
 * Wandelt ein v1-Nutzerdokument in eine Zeile für `users` um. null, wenn ID oder E-Mail fehlen.
 * Übernommen wird nur, was zum Konto gehört. Fachliche Felder (Tagesstatus, Pins, Rechnungsadresse …)
 * holt der Schritt des jeweiligen Moduls. Nie übernommen: IP, User-Agent, Geräte-IDs.
 */
export function convertUser(doc: V1Doc, report: MigrationReport, now: Date): ConvertedUser | null {
  const v1Id = idOf(doc._id);
  const email = typeof doc.email === "string" ? doc.email.trim().toLowerCase() : "";
  if (!v1Id || !email) {
    report.warn("Nutzer ohne ID oder E-Mail übersprungen", v1Id ?? "?");
    return null;
  }
  let role: Role = "berater";
  if (isRole(doc.role)) role = doc.role;
  else report.warn("Unbekannte Rolle, als berater übernommen", v1Id);
  const blocked = doc.isBlocked === true;
  const createdAt = toDate(doc.createdAt) ?? objectIdDate(v1Id) ?? now;

  return {
    v1Id,
    row: {
      email,
      passwordHash: toText(doc.password),
      name: toText(doc.name) ?? email.split("@")[0] ?? email,
      nickname: toText(doc.nickname),
      nicknameChangedAt: toDate(doc.nicknameLastChangedAt),
      phone: toText(doc.phone),
      profilePictureUrl: toText(doc.profilePicture),
      role,
      extraRoles: Array.isArray(doc.roles) ? [...new Set(doc.roles.filter(isRole))].filter((r) => r !== role) : [],
      approvalStatus: approval(doc),
      isActive: doc.isActive !== false,
      blockedAt: blocked ? (toDate(doc.blockedAt) ?? now) : null,
      blockedUntil: blocked ? toDate(doc.blockUntil) : null,
      blockReason: blocked ? toText(doc.blockReason) : null,
      vodafoneContractStart: toDate(doc.vodafoneContractStart),
      paymentRequired: doc.paymentRequired === true,
      giftedUntil: toDate(doc.giftedUntil),
      emailVerifiedAt: doc.emailVerified === true ? (toDate(doc.emailVerifiedAt) ?? createdAt) : null,
      termsAcceptedVersion: version(doc.termsAcceptedVersion),
      termsAcceptedAt: toDate(doc.termsAcceptedAt),
      isCompanyAccount: doc.isCompanyAccount === true,
      companyName: toText(doc.companyName),
      verifiedCompanyEmail: toText(doc.verifiedCompanyEmail),
      whatsappNumber: toText(doc.whatsappNumber),
      instagramUrl: toText(doc.instagramUrl),
      tiktokUrl: toText(doc.tiktokUrl),
      facebookUrl: toText(doc.facebookUrl),
      referralCode: toText(doc.referralCode),
      lastActivityAt: toDate(doc.lastActivity),
      createdAt,
      updatedAt: toDate(doc.updatedAt) ?? createdAt,
    },
    refs: { teamId: idOf(doc.teamId), mentorId: idOf(doc.mentorId), strukturleiterId: idOf(doc.strukturleiterId), referredById: idOf(doc.referredBy) },
  };
}
