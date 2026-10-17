import type { PrivacyCleanable } from "../../lib/privacy/PrivacyCleanable";
import type { RefreshTokenStore } from "./refreshTokens";

/**
 * Datenschutz-Hooks des Auth-Moduls. Personenbezogen sind hier nur die Sitzungen (Refresh-Tokens).
 * Fehlversuche in `login_failures` sind gehasht, keinem Konto zuordenbar und nach 15 Minuten
 * per TTL gelöscht. Einträge in `audit_logs` gehören dem Sicherheitsprotokoll (90 Tage, v1-TTL).
 */
export function authPrivacy(tokens: RefreshTokenStore, now: () => Date = () => new Date()): PrivacyCleanable {
  return {
    privacyKey: "sessions",
    async onUserExport(userId) {
      // Nur Zeitpunkte, nie Token-Hashes
      return { activeSessions: await tokens.activeSessions(userId, now()) };
    },
    async onUserDelete(userId) {
      return { action: "deleted", count: await tokens.deleteForUser(userId) };
    },
  };
}
