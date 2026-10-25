import type { AppServices } from "./app";
import type { Database } from "./config/db";
import type { Env } from "./config/env";
import type { RetentionRule } from "./lib/db/retention";
import { createPrivacyRegistry, type PrivacyRegistry } from "./lib/privacy/privacyRegistry";
import { AccessScope } from "./modules/access/AccessScope";
import { pgScopeSource } from "./modules/access/ScopeSource";
import { pgAuditLog } from "./modules/audit/auditLog";
import { auditRetention } from "./modules/audit/auditRetention";
import { AuthService } from "./modules/auth/AuthService";
import { authPrivacy } from "./modules/auth/authPrivacy";
import { authRetention } from "./modules/auth/authRetention";
import { pgLoginThrottle } from "./modules/auth/loginThrottle";
import { pgRefreshTokenStore } from "./modules/auth/refreshTokens";
import { pgConsentRepository } from "./modules/consent/ConsentRepository";
import { ConsentService } from "./modules/consent/ConsentService";
import { consentRetention } from "./modules/consent/consentRetention";
import { pgLogbookRepository } from "./modules/logbook/LogbookRepository";
import { LogbookService } from "./modules/logbook/LogbookService";
import { logbookPrivacy } from "./modules/logbook/logbookPrivacy";
import { pgUserExtras } from "./modules/users/UserExtras";
import { pgUserRepository } from "./modules/users/UserRepository";

export interface Services extends AppServices {
  logbook: LogbookService;
  access: AccessScope;
  privacy: PrivacyRegistry;
  /** Löschfristen aller Module, ausgeführt vom Aufräum-Job. */
  retention: RetentionRule[];
}

/** Erzeugt alle Services mit ihren PostgreSQL-Anbindungen. Tests bauen Services mit Fakes selbst. */
export function createServices(env: Env, db: Database, pingDatabase?: () => Promise<boolean>): Services {
  const audit = pgAuditLog(db);
  const tokens = pgRefreshTokenStore(db);

  const privacy = createPrivacyRegistry();
  privacy.register(authPrivacy(tokens));
  // Fahrtenbuch ohne Löschfrist: Steuerunterlage des Beraters, gelöscht wird es mit dem Konto
  const logbook = new LogbookService(pgLogbookRepository(db), env.DATA_CIPHER_KEY);
  privacy.register(logbookPrivacy(logbook));

  return {
    consent: new ConsentService(pgConsentRepository(db)),
    auth: new AuthService({
      users: pgUserRepository(db),
      extras: pgUserExtras(db),
      tokens,
      throttle: pgLoginThrottle(db),
      audit,
      jwtSecret: env.JWT_SECRET,
    }),
    logbook,
    access: new AccessScope(pgScopeSource(db), (kind, id, requester) => {
      void audit.security({ action: "CROSS_TEAM_ACCESS_DENIED", userId: requester.id, email: requester.email, ip: "unbekannt", target: { type: kind, id } });
    }),
    privacy,
    retention: [...authRetention, auditRetention, consentRetention(env.CONSENT_LOG_DAYS)],
    pingDatabase,
  };
}
