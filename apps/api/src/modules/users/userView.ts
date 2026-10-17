import type { UserDoc } from "./User.model";

/**
 * Felder, die der v1-Client am Nutzer liest und die unverändert durchgereicht werden
 * (Port von `shapeUser` aus v1 routes/auth.ts). Nicht mehr enthalten, weil der Client sie
 * nicht braucht und sie personenbezogen oder intern sind: lastIpAddress, userAgent,
 * deviceIds, stripeCustomerId.
 */
const PASSTHROUGH = [
  "email", "name", "role", "roles", "profilePicture", "phone", "createdAt", "updatedAt",
  "whatsappNumber", "tiktokUrl", "instagramUrl", "facebookUrl", "isActive", "isBlocked", "isOnline",
  "emailVerified", "termsAccepted", "isCompanyAccount", "companyName", "verifiedCompanyEmail",
  "strukturleiterId", "mentorId", "teamId", "hasStripeCustomer", "hasActiveSubscription", "freeTrialEndsAt",
  "lockedUntil", "nickname", "nicknameLastChangedAt", "dailySummaryEnabled", "dailySummaryTime",
  "dailySummaryIncludeStreetList", "dailySummaryIncludeMissingStreetListWarnings",
  "dailySummaryIncludeNoSalesWarnings", "lastDailySummarySentAt", "vodafoneContractStart",
  "billingFirstName", "billingLastName", "billingStreet", "billingZip", "billingCity",
  "dailyStatusReason", "dailyStatusUpdatedAt", "dailyAttendance", "dailyAttendanceUpdatedAt",
  "dailyAttendanceMinutesLate", "dailyAttendanceReason", "strukturleiterCustomGroups",
  "strukturleiterHiddenGroups", "strukturleiterGroupName", "vpkn", "dailyPins", "tomorrowPins",
  "referralCode", "referredBy", "allowedVerticals",
] as const;

/** Felder mit Standardwert, falls sie im Dokument fehlen (wie in v1). */
const DEFAULTS: Record<string, unknown> = {
  permissions: [],
  isAnonymousInLeaderboard: false,
  recentEmojis: ["❤️", "👍", "😂", "🔥", "🎉"],
  billingCountry: "DE",
  dailyStatus: "active",
  termsAcceptedVersion: null,
  termsAcceptedAt: null,
  battleInactive: false,
  aiCoachTrialStart: null,
  giftedUntil: null,
  referralClicks: 0,
  partnerStatus: "none",
};

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

function paymentRequired(user: UserDoc, now: Date): boolean {
  if (user.giftedUntil && new Date(user.giftedUntil) > now) return false;
  return user.paymentRequired ?? false;
}

/** Profil-Antwort im Format, das der v1-Client erwartet. Enthält nie den Passwort-Hash. */
export function toUserView(user: UserDoc, extras: UserViewExtras, now = new Date()): UserView {
  const view: Record<string, unknown> = {};
  for (const key of PASSTHROUGH) view[key] = user[key];
  for (const [key, fallback] of Object.entries(DEFAULTS)) view[key] = user[key] ?? fallback;

  const month = vodafoneMonth(user.vodafoneContractStart, now);
  return {
    ...view,
    id: String(user._id),
    email: user.email,
    role: user.role,
    vodafoneCurrentMonth: month,
    isJuniorBerater: month !== null && month <= 4,
    isRegularBerater: month !== null ? month >= 5 : !user.vodafoneContractStart && !user.mentorId && user.role === "berater",
    paymentRequired: paymentRequired(user, now),
    subscriptionStatus: extras.subscriptionStatus,
    isTrioHeim: extras.isTrioHeim,
  };
}
