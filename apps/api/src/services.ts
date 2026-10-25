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
import { pgCoachMemoryRepository } from "./modules/copilot/CoachMemoryRepository";
import { pgCopilotLogRepository } from "./modules/copilot/CopilotLogRepository";
import { copilotPrivacy } from "./modules/copilot/copilotPrivacy";
import { copilotRetention } from "./modules/copilot/copilotRetention";
import { CopilotService } from "./modules/copilot/CopilotService";
import { azureOpenAiClient } from "./modules/copilot/llm/LlmClient";
import { pgUserExtras } from "./modules/users/UserExtras";
import { pgUserRepository } from "./modules/users/UserRepository";

function copilotLlm(env: Env) {
  if (!env.AZURE_OPENAI_ENDPOINT || !env.AZURE_OPENAI_API_KEY) return null;
  return azureOpenAiClient({ endpoint: env.AZURE_OPENAI_ENDPOINT, apiKey: env.AZURE_OPENAI_API_KEY, deployment: env.AZURE_OPENAI_DEPLOYMENT, apiVersion: env.AZURE_OPENAI_API_VERSION });
}

export interface Services extends AppServices {
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
  const coachMemories = pgCoachMemoryRepository(db, env.DATA_CIPHER_KEY, env.COPILOT_MEMORY_DAYS);
  const copilotLogs = pgCopilotLogRepository(db, env.DATA_CIPHER_KEY);
  privacy.register(copilotPrivacy(coachMemories, copilotLogs));

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
    copilot: new CopilotService({ llm: copilotLlm(env), memories: coachMemories, logs: copilotLogs }),
    access: new AccessScope(pgScopeSource(db), (kind, id, requester) => {
      void audit.security({ action: "CROSS_TEAM_ACCESS_DENIED", userId: requester.id, email: requester.email, ip: "unbekannt", target: { type: kind, id } });
    }),
    privacy,
    retention: [...authRetention, auditRetention, consentRetention(env.CONSENT_LOG_DAYS), ...copilotRetention(env.COPILOT_LOG_DAYS)],
    pingDatabase,
  };
}
