import type { SubscriptionStatus } from "../profile/profileTypes";

/** Stand einer vergebenen Lizenz: angemeldet und aktiv, Einladung offen oder Konto inaktiv. */
export type SeatState = "active" | "pending" | "inactive";

/** Stand eines selbstzahlenden Partners: zahlt, angemeldet ohne Abo, oder noch nicht angemeldet. */
export type PartnerState = "paying" | "unpaid" | "pending";

/** Person hinter einer E-Mail (v1 LicensedMember aus GET /teams/my-team/licenses). */
export interface LicenseMember {
  email: string;
  name: string | null;
  registered: boolean;
  active: boolean;
  paying: boolean;
}

/** Sondertarif mit Mindestmenge ab einem Vertragsmonat (v1 contractMinLicenses). */
export interface LicenseContract {
  minLicenses: number;
  startMonth: number;
  currentMonth: number;
  breached: boolean;
}

/** Alles, was die Seite Team-Lizenzierung braucht; aus der v1-Antwort gelesen. */
export interface TeamLicenses {
  teamName: string;
  /** Gebuchte Lizenzen (Plätze). */
  licenseCount: number;
  /** Untergrenze für das Abo (Emre: 5). */
  minLicenses: number;
  /** Zugewiesene E-Mails in Platz-Reihenfolge. */
  licensedEmails: readonly string[];
  members: readonly LicenseMember[];
  /** Selbstzahlende Partner (v1 referredEmails). */
  partnerEmails: readonly string[];
  partners: readonly LicenseMember[];
  status: SubscriptionStatus;
  renewsAt?: string;
  contract: LicenseContract | null;
  /** Partner-Gutschrift als Anteil 0–1 (v1 affiliate.rate, derzeit 0). */
  creditRate: number;
  referralCode?: string;
  demo: boolean;
}

/** Eine Zeile der Mitgliederliste: belegter oder freier Platz. */
export type SeatRow =
  | { kind: "member"; slot: number; email: string; name: string | null; state: SeatState }
  | { kind: "free"; slot: number };

export type SeatFilter = "all" | SeatState | "free";

export interface LicenseResult {
  ok: boolean;
  message?: string;
}
