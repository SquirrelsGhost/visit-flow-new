import mongoose from "mongoose";
import type { AppServices } from "./app";
import type { Env } from "./config/env";
import { createPrivacyRegistry, type PrivacyRegistry } from "./lib/privacy/privacyRegistry";
import { AccessScope } from "./modules/access/AccessScope";
import { mongoScopeSource } from "./modules/access/ScopeSource";
import { mongoAuditLog } from "./modules/audit/auditLog";
import { AuthService } from "./modules/auth/AuthService";
import { authPrivacy } from "./modules/auth/authPrivacy";
import { loginFailureModel, mongoLoginThrottle } from "./modules/auth/loginThrottle";
import { refreshTokenModel } from "./modules/auth/RefreshToken.model";
import { mongoRefreshTokenStore } from "./modules/auth/refreshTokens";
import { consentLogModel } from "./modules/consent/ConsentLog.model";
import { mongoConsentRepository } from "./modules/consent/ConsentRepository";
import { ConsentService } from "./modules/consent/ConsentService";
import { coachMemoryModel } from "./modules/copilot/CoachMemory.model";
import { mongoCoachMemoryRepository } from "./modules/copilot/CoachMemoryRepository";
import { copilotLogModel } from "./modules/copilot/CopilotLog.model";
import { mongoCopilotLogRepository } from "./modules/copilot/CopilotLogRepository";
import { copilotPrivacy } from "./modules/copilot/copilotPrivacy";
import { CopilotService } from "./modules/copilot/CopilotService";
import { azureOpenAiClient } from "./modules/copilot/llm/LlmClient";
import { userModel } from "./modules/users/User.model";
import { mongoUserExtras } from "./modules/users/UserExtras";
import { mongoUserRepository } from "./modules/users/UserRepository";

function copilotLlm(env: Env) {
  if (!env.AZURE_OPENAI_ENDPOINT || !env.AZURE_OPENAI_API_KEY) return null;
  return azureOpenAiClient({ endpoint: env.AZURE_OPENAI_ENDPOINT, apiKey: env.AZURE_OPENAI_API_KEY, deployment: env.AZURE_OPENAI_DEPLOYMENT, apiVersion: env.AZURE_OPENAI_API_VERSION });
}

export interface Services extends AppServices {
  access: AccessScope;
  privacy: PrivacyRegistry;
}

/** Erzeugt alle Services mit ihren MongoDB-Anbindungen. Tests bauen Services mit Fakes selbst. */
export function createServices(env: Env, db = mongoose.connection): Services {
  const audit = mongoAuditLog(db);
  const tokens = mongoRefreshTokenStore(refreshTokenModel());

  const privacy = createPrivacyRegistry();
  privacy.register(authPrivacy(tokens));
  const coachMemories = mongoCoachMemoryRepository(coachMemoryModel(), env.DATA_CIPHER_KEY, env.COPILOT_MEMORY_DAYS);
  const copilotLogs = mongoCopilotLogRepository(copilotLogModel(env.COPILOT_LOG_DAYS), env.DATA_CIPHER_KEY);
  privacy.register(copilotPrivacy(coachMemories, copilotLogs));

  return {
    consent: new ConsentService(mongoConsentRepository(consentLogModel(env.CONSENT_LOG_DAYS))),
    auth: new AuthService({
      users: mongoUserRepository(userModel()),
      extras: mongoUserExtras(db),
      tokens,
      throttle: mongoLoginThrottle(loginFailureModel()),
      audit,
      jwtSecret: env.JWT_SECRET,
    }),
    copilot: new CopilotService({ llm: copilotLlm(env), memories: coachMemories, logs: copilotLogs }),
    access: new AccessScope(mongoScopeSource(db), (kind, id, requester) => {
      void audit.security({ action: "CROSS_TEAM_ACCESS_DENIED", userId: requester.id, email: requester.email, ip: "unbekannt", target: { type: kind, id } });
    }),
    privacy,
  };
}
