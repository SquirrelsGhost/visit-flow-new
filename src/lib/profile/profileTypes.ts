/** Rechnungsadresse wie in v1 (billingFirstName … billingCountry am Benutzer). */
export interface BillingAddress {
  firstName: string;
  lastName: string;
  street: string;
  zip: string;
  city: string;
  country: string;
}

/** Was die Profilseite vom angemeldeten Benutzer anzeigt; aus den v1-Feldern gelesen. */
export interface ProfileData {
  name: string;
  email: string;
  role: string;
  nickname?: string;
  nicknameChangedAt?: string;
  anonymous: boolean;
  billing: BillingAddress;
  vpkn?: string;
  teamId?: string;
  mentorId?: string;
  /** Vodafone-Vertragsmonat (v1 vodafoneCurrentMonth); null ohne Vertragsstart. */
  contractMonth: number | null;
}

/** Felder, die PATCH /auth/profile (v1) annimmt; Namen wie am Benutzer. */
export type ProfilePatch = Partial<{
  name: string;
  email: string;
  nickname: string;
  nicknameLastChangedAt: string;
  isAnonymousInLeaderboard: boolean;
  billingFirstName: string;
  billingLastName: string;
  billingStreet: string;
  billingZip: string;
  billingCity: string;
  billingCountry: string;
  vpkn: string;
}>;

export interface XpProgress {
  level: number;
  current: number;
  next: number;
}

export type SubscriptionStatus = "active" | "incomplete" | "canceled" | "inactive";

export interface Subscription {
  planId: string;
  status: SubscriptionStatus;
  /** Preis in Cent pro Monat, 0 = kostenlos. */
  price: number;
  features: readonly string[];
  /** Team-Lizenzen (v1 TeamLicensingManager): gebucht und vergeben; fehlt, wenn der Server sie nicht liefert. */
  licenses?: { total: number; used: number };
  /** Nächste Abbuchung (ISO-Datum). */
  renewsAt?: string;
}

export type InvoiceStatus = "paid" | "open" | "void" | "draft" | "uncollectible";

export interface Invoice {
  id: string;
  status: InvoiceStatus;
  date: string;
  /** Betrag in Cent. */
  amount: number;
  description?: string;
  url?: string;
}

export type TierLevel = "bronze" | "silver" | "gold" | "platinum" | "diamond";

/** Erfolg aus v1 AchievementService: Fortschritt zur nächsten Stufe. */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  current: number;
  /** Anforderung der nächsten Stufe; bei voller Stufe die letzte. */
  target: number;
  /** Höchste erreichte Stufe, ohne Stufe noch gesperrt. */
  tier?: TierLevel;
}

export interface SaveResult {
  ok: boolean;
  message?: string;
}

/** Speichern aus useProfile: Felder und Erfolgsmeldung, true bei Erfolg. */
export type SaveProfile = (patch: ProfilePatch, successMessage: string) => Promise<boolean>;
