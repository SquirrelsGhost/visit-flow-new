import { LICENSES } from "../onboarding/licenses";
import type { SubscriptionStatus } from "../profile/profileTypes";
import type { LicenseContract, LicenseMember, TeamLicenses } from "./licenseTypes";

type Raw = Record<string, unknown>;

const STATUS: readonly SubscriptionStatus[] = ["active", "incomplete", "canceled"];

const isRaw = (value: unknown): value is Raw => typeof value === "object" && value !== null;
const str = (value: unknown) => (typeof value === "string" ? value : undefined);
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

const emails = (value: unknown): string[] => (Array.isArray(value) ? value.filter((e): e is string => typeof e === "string").map((e) => e.trim().toLowerCase()) : []);

function members(value: unknown): LicenseMember[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRaw).map((m) => ({
    email: (str(m.email) ?? "").toLowerCase(),
    name: str(m.name) ?? null,
    registered: m.registered === true,
    active: m.isActive === true,
    paying: m.hasActiveSubscription === true,
  }));
}

function contract(data: Raw): LicenseContract | null {
  const min = num(data.contractMinLicenses);
  if (!min) return null;
  return { minLicenses: min, startMonth: num(data.contractMinLicensesStartMonth) ?? 3, currentMonth: num(data.subscriptionMonth) ?? 1, breached: data.contractBreached === true };
}

/** Antwort von GET /teams/my-team/licenses (v1 TeamLicenseData) in das Seitenmodell. */
export function normalizeTeamLicenses(data: unknown): TeamLicenses | null {
  if (!isRaw(data)) return null;
  const subscription = isRaw(data.subscription) ? data.subscription : null;
  const affiliate = isRaw(data.affiliate) ? data.affiliate : null;
  const licensedEmails = emails(data.licensedEmails);
  return {
    teamName: str(data.teamName) ?? "",
    // Nicht auf die Zahl der E-Mails anheben: eine Überbelegung soll sichtbar bleiben
    licenseCount: Math.max(0, num(data.licenseCount) ?? licensedEmails.length),
    minLicenses: num(data.minLicenses) ?? LICENSES.min,
    licensedEmails,
    members: members(data.members),
    partnerEmails: emails(data.referredEmails),
    partners: members(data.referredMembers),
    status: STATUS.find((s) => s === subscription?.status) ?? "inactive",
    renewsAt: str(subscription?.currentPeriodEnd),
    contract: contract(data),
    creditRate: num(affiliate?.rate) ?? 0,
    referralCode: str(data.referralCode),
    demo: data.isDemoMode === true,
  };
}
