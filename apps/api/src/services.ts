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
import { userModel } from "./modules/users/User.model";
import { mongoUserExtras } from "./modules/users/UserExtras";
import { mongoUserRepository } from "./modules/users/UserRepository";

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
    access: new AccessScope(mongoScopeSource(db), (kind, id, requester) => {
      void audit.security({ action: "CROSS_TEAM_ACCESS_DENIED", userId: requester.id, email: requester.email, ip: "unbekannt", target: { type: kind, id } });
    }),
    privacy,
  };
}
