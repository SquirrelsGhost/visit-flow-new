import type { Request, Response } from "express";
import { REFRESH_TOKEN_DAYS } from "./refreshTokens";

/** Gleicher Cookie wie v1: Name, Pfad und Optionen müssen übereinstimmen, sonst loggt der Wechsel aus. */
export const REFRESH_COOKIE = "vf_refresh";
const COOKIE_PATH = "/api/auth";

const options = (secure: boolean) => ({ httpOnly: true, secure, sameSite: "strict" as const, path: COOKIE_PATH });

export function setRefreshCookie(res: Response, raw: string, secure: boolean): void {
  res.cookie(REFRESH_COOKIE, raw, { ...options(secure), maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000 });
}

export function clearRefreshCookie(res: Response, secure: boolean): void {
  res.clearCookie(REFRESH_COOKIE, options(secure));
}

export function readRefreshCookie(req: Request): string | null {
  const value: unknown = req.cookies?.[REFRESH_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : null;
}
