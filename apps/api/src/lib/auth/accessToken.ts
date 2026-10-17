import jwt from "jsonwebtoken";
import { z } from "zod";
import { ROLES, type Role } from "@visit-flow/shared/roles";

/**
 * Access-Token im selben Format wie v1 (server/src/middleware/auth.ts):
 * HS256, Payload { id, email, role }, 15 Minuten gültig, als `Authorization: Bearer`.
 * Beide Systeme nutzen dasselbe JWT_SECRET, damit ein Login in v1 auch in v2 gilt und umgekehrt.
 */
export const ACCESS_TOKEN_TTL = "15m";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

const payloadSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: z.enum(ROLES),
});

export function signAccessToken(user: AuthUser, secret: string): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/** Liefert den Nutzer oder null, wenn das Token fehlt, abgelaufen, gefälscht oder unvollständig ist. */
export function verifyAccessToken(token: string, secret: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    const parsed = payloadSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function bearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}
