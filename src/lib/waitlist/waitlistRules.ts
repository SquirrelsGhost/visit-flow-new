/**
 * Regeln der Warteliste auf der Website, ohne Server-Abhängigkeiten (auch im Formular genutzt).
 */
export type WaitlistRole = "vertriebler" | "teamleiter";

export const WAITLIST_ROLES: readonly WaitlistRole[] = ["vertriebler", "teamleiter"];

/** Version des Einwilligungstextes; bei Änderung des Textes hochzählen (Nachweis nach DSGVO Art. 7). */
export const WAITLIST_CONSENT_VERSION = 1;

/** Erst ab so vielen Einträgen zeigt die Website die Gesamtzahl (kleine Zahlen wirken leer). */
export const WAITLIST_SHOW_COUNT_FROM = 50;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface WaitlistInput {
  email: string;
  role: WaitlistRole;
  teamSize?: number;
  consent: boolean;
  /** Honigtopf-Feld: Menschen sehen es nicht, Bots füllen es aus. */
  website?: string;
}

export type WaitlistParse = { ok: true; value: WaitlistInput } | { ok: false; error: "email" | "consent" | "role" };

export function parseWaitlistInput(body: Record<string, unknown>): WaitlistParse {
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 254 || !EMAIL.test(email)) return { ok: false, error: "email" };
  if (body.consent !== true) return { ok: false, error: "consent" };
  const role = WAITLIST_ROLES.includes(body.role as WaitlistRole) ? (body.role as WaitlistRole) : null;
  if (!role) return { ok: false, error: "role" };
  const size = typeof body.teamSize === "number" && Number.isFinite(body.teamSize) ? Math.round(body.teamSize) : undefined;
  return {
    ok: true,
    value: {
      email,
      role,
      teamSize: size !== undefined && size > 0 && size <= 1000 ? size : undefined,
      consent: true,
      website: typeof body.website === "string" ? body.website : undefined,
    },
  };
}
