import type { UserRecord } from "./User.model";

export interface UserViewExtras {
  subscriptionStatus: string;
  isTrioHeim: boolean;
}

export type UserView = Record<string, unknown> & { id: string; email: string; role: string };

/** Vertragsmonat seit Vodafone-Vertragsbeginn, 1-basiert; null ohne Beginn oder in der Zukunft. */
export function vodafoneMonth(start: Date | null | undefined, now: Date): number | null {
  if (!start) return null;
  const begin = new Date(start);
  const months = (now.getFullYear() - begin.getFullYear()) * 12 + (now.getMonth() - begin.getMonth()) + 1;
  return months > 0 ? months : null;
}

function paymentRequired(user: UserRecord, now: Date): boolean {
  if (user.giftedUntil && user.giftedUntil > now) return false;
  return user.paymentRequired;
}

/**
 * Profil-Antwort. Die Feldnamen bleiben die, die der Client aus v1 kennt (`roles`, `isWhitelisted`,
 * `isBlocked` …), damit er nicht umgebaut werden muss. Fachliche Felder (Tagesstatus, Pins,
 * Rechnungsadresse …) ergänzt das jeweilige Modul, sobald es portiert ist. Nie dabei: Passwort-Hash.
 */
export function toUserView(user: UserRecord, extras: UserViewExtras, now = new Date()): UserView {
  const month = vodafoneMonth(user.vodafoneContractStart, now);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    nicknameLastChangedAt: user.nicknameChangedAt,
    phone: user.phone,
    profilePicture: user.profilePictureUrl,
    role: user.role,
    roles: user.extraRoles,
    isActive: user.isActive,
    isWhitelisted: user.approvalStatus === "approved",
    whitelistStatus: user.approvalStatus,
    isBlocked: user.blockedAt !== null,
    blockUntil: user.blockedUntil,
    teamId: user.teamId,
    mentorId: user.mentorId,
    strukturleiterId: user.strukturleiterId,
    vodafoneContractStart: user.vodafoneContractStart,
    vodafoneCurrentMonth: month,
    isJuniorBerater: month !== null && month <= 4,
    isRegularBerater: month !== null ? month >= 5 : !user.vodafoneContractStart && !user.mentorId && user.role === "berater",
    paymentRequired: paymentRequired(user, now),
    giftedUntil: user.giftedUntil,
    subscriptionStatus: extras.subscriptionStatus,
    isTrioHeim: extras.isTrioHeim,
    emailVerified: user.emailVerifiedAt !== null,
    termsAcceptedVersion: user.termsAcceptedVersion,
    termsAcceptedAt: user.termsAcceptedAt,
    isCompanyAccount: user.isCompanyAccount,
    companyName: user.companyName,
    verifiedCompanyEmail: user.verifiedCompanyEmail,
    whatsappNumber: user.whatsappNumber,
    instagramUrl: user.instagramUrl,
    tiktokUrl: user.tiktokUrl,
    facebookUrl: user.facebookUrl,
    referralCode: user.referralCode,
    referredBy: user.referredById,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
