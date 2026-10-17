import { isRole } from "@visit-flow/shared/roles";
import type { LoginInput } from "@visit-flow/shared/auth";
import { signAccessToken } from "../../lib/auth/accessToken";
import { verifyPassword } from "../../lib/auth/password";
import { notFound, tooManyRequests, unauthorized } from "../../lib/http/HttpError";
import type { AuditLog } from "../audit/auditLog";
import type { UserExtrasSource } from "../users/UserExtras";
import type { UserDoc } from "../users/User.model";
import type { UserRepository } from "../users/UserRepository";
import { toUserView, type UserView } from "../users/userView";
import { assertMayLogin, blockExpired } from "./loginChecks";
import type { LoginThrottle } from "./loginThrottle";
import type { RefreshTokenStore } from "./refreshTokens";

export const GENERIC_LOGIN_ERROR = "E-Mail-Adresse oder Passwort ist falsch.";
const LOCKED_MESSAGE = "Zu viele fehlgeschlagene Login-Versuche. Bitte warten Sie und versuchen Sie es später erneut.";

export interface AuthDeps {
  users: UserRepository;
  extras: UserExtrasSource;
  tokens: RefreshTokenStore;
  throttle: LoginThrottle;
  audit: AuditLog;
  jwtSecret: string;
  now?: () => Date;
}

export interface ClientInfo {
  ip: string;
  userAgent?: string;
}

export interface LoginResult {
  user: UserView;
  token: string;
  refreshToken: string;
  showTeamLeiterLiveTracking: boolean;
}

export class AuthService {
  private readonly now: () => Date;

  constructor(private readonly deps: AuthDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  async login(input: LoginInput, client: ClientInfo): Promise<LoginResult> {
    const { users, throttle, audit } = this.deps;
    const now = this.now();
    const actor = { email: input.email, ip: client.ip, userAgent: client.userAgent };

    const lockedUntil = await throttle.lockedUntil(client.ip, input.email, now);
    if (lockedUntil) {
      await audit.security({ action: "LOGIN_BLOCKED", ...actor, metadata: { reason: "Too many failed attempts", lockedUntil } });
      throw tooManyRequests(LOCKED_MESSAGE, { lockedUntil });
    }

    const user = await users.findByEmailForLogin(input.email);
    if (!(await verifyPassword(input.password, user?.password)) || !user) {
      await throttle.recordFailure(client.ip, input.email, now);
      await audit.security({ action: "LOGIN_FAILED", ...actor, userId: user ? String(user._id) : undefined });
      throw unauthorized(GENERIC_LOGIN_ERROR);
    }

    const userId = String(user._id);
    if (blockExpired(user, now)) await users.clearExpiredBlock(userId);
    try {
      assertMayLogin(user, now);
    } catch (error) {
      await audit.security({ action: "LOGIN_BLOCKED", ...actor, userId, metadata: { whitelistStatus: user.whitelistStatus } });
      throw error;
    }

    await Promise.all([throttle.reset(client.ip, input.email), users.markLoginSuccess(userId, now)]);
    await audit.security({ action: "LOGIN_SUCCESS", ...actor, userId, metadata: { role: user.role } });

    const [view, refreshToken, showTeamLeiterLiveTracking] = await Promise.all([
      this.view(user),
      this.deps.tokens.issue(userId, now),
      this.deps.extras.showTeamLeiterLiveTracking(),
    ]);
    return { user: view, token: this.accessToken(user), refreshToken, showTeamLeiterLiveTracking };
  }

  /** Tauscht ein Refresh-Token gegen ein neues Access-Token und ein neues Refresh-Token derselben Kette. */
  async refresh(raw: string, client: ClientInfo): Promise<{ token: string; refreshToken: string }> {
    const now = this.now();
    const result = await this.deps.tokens.consume(raw, now);
    if (!result.ok) {
      if (result.reason === "reused") {
        await this.deps.audit.security({ action: "REFRESH_TOKEN_REUSED", ip: client.ip, userAgent: client.userAgent });
      }
      throw unauthorized("Sitzung abgelaufen, bitte erneut anmelden");
    }
    const user = await this.deps.users.findById(result.userId);
    // Gesperrte und deaktivierte Konten bekommen keine neuen Tokens (wie v1)
    if (!user || user.isActive === false || (user.isBlocked && !blockExpired(user, now))) {
      throw unauthorized("Sitzung abgelaufen, bitte erneut anmelden");
    }
    const refreshToken = await this.deps.tokens.issue(result.userId, now, result.familyId);
    return { token: this.accessToken(user), refreshToken };
  }

  async logout(raw: string | null): Promise<void> {
    if (raw) await this.deps.tokens.revoke(raw);
  }

  async profile(userId: string): Promise<{ user: UserView }> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw notFound("Nutzer nicht gefunden");
    return { user: await this.view(user) };
  }

  private async view(user: UserDoc): Promise<UserView> {
    return toUserView(user, await this.deps.extras.forUser(user), this.now());
  }

  private accessToken(user: UserDoc): string {
    if (!isRole(user.role)) throw unauthorized("Unbekannte Rolle");
    return signAccessToken({ id: String(user._id), email: user.email, role: user.role }, this.deps.jwtSecret);
  }
}
