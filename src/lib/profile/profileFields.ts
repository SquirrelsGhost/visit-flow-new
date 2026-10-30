import type { AuthUser } from "@/shared/auth/authSchemas";
import type { BillingAddress, ProfileData, ProfilePatch } from "./profileTypes";

const text = (user: AuthUser, key: string): string | undefined => {
  const value = user[key];
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  return undefined;
};

/** IDs kommen aus Mongo teils als { $oid } (v1 extractId). */
const id = (user: AuthUser, key: string): string | undefined => {
  const value = user[key];
  if (value && typeof value === "object" && "$oid" in value) return String((value as { $oid: unknown }).$oid);
  return text(user, key);
};

function contractMonth(user: AuthUser): number | null {
  if (!user.vodafoneContractStart) return null;
  const month = Number(user.vodafoneCurrentMonth);
  return Number.isFinite(month) ? month : 0;
}

/** Liest die Profilfelder aus dem v1-Benutzer; fehlende Werte bleiben leer. */
export function readProfile(user: AuthUser): ProfileData {
  return {
    name: user.name?.trim() || user.email,
    email: user.email,
    role: user.role,
    nickname: text(user, "nickname"),
    nicknameChangedAt: text(user, "nicknameLastChangedAt"),
    anonymous: user.isAnonymousInLeaderboard === true,
    billing: {
      firstName: text(user, "billingFirstName") ?? "",
      lastName: text(user, "billingLastName") ?? "",
      street: text(user, "billingStreet") ?? "",
      zip: text(user, "billingZip") ?? "",
      city: text(user, "billingCity") ?? "",
      country: text(user, "billingCountry") ?? "DE",
    },
    vpkn: text(user, "vpkn"),
    teamId: id(user, "teamId"),
    mentorId: id(user, "mentorId"),
    contractMonth: contractMonth(user),
  };
}

export function billingPatch(billing: BillingAddress): ProfilePatch {
  return {
    billingFirstName: billing.firstName,
    billingLastName: billing.lastName,
    billingStreet: billing.street,
    billingZip: billing.zip,
    billingCity: billing.city,
    billingCountry: billing.country,
  };
}

/** Zwei Zeilen für die Anzeige, leer wenn nichts hinterlegt ist (v1 zeigt DE nicht an). */
export function billingLines(billing: BillingAddress): string[] {
  const name = [billing.firstName, billing.lastName].filter(Boolean).join(" ");
  const place = [billing.zip, billing.city].filter(Boolean).join(" ");
  const country = billing.country && billing.country !== "DE" ? billing.country : "";
  return [name, billing.street, [place, country].filter(Boolean).join(", ")].filter(Boolean);
}
