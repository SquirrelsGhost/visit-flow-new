import { profileTexts } from "../../texts/profileTexts";
import type { TierLevel } from "./profileTypes";

const DAY = 86_400_000;
export const NICKNAME_MAX = 20;
export const NICKNAME_COOLDOWN_DAYS = 7;
/** v1-Server verlangt 6 Zeichen; v2 fragt schon im Formular nach 8. */
export const PASSWORD_MIN = 8;

const rules = profileTexts.rules;

/** Tage bis zur nächsten erlaubten Nickname-Änderung (v1: alle 7 Tage), 0 = jetzt möglich. */
export function nicknameDaysLeft(changedAt: string | undefined, now = Date.now()): number {
  if (!changedAt) return 0;
  const since = (now - new Date(changedAt).getTime()) / DAY;
  return Number.isFinite(since) ? Math.max(0, Math.ceil(NICKNAME_COOLDOWN_DAYS - since)) : 0;
}

/** Prüft einen Nickname wie der v1-Server: Pflicht, max. 20 Zeichen, keine Leerzeichen. */
export function nicknameError(value: string): string | null {
  if (!value.trim()) return rules.nicknameEmpty;
  if (/\s/.test(value)) return rules.nicknameSpaces;
  if (value.length > NICKNAME_MAX) return rules.nicknameLong;
  return null;
}

export interface PasswordDraft {
  current: string;
  next: string;
  confirm: string;
}

export function passwordError({ current, next, confirm }: PasswordDraft): string | null {
  if (!current || !next) return rules.passwordRequired;
  if (next.length < PASSWORD_MIN) return rules.passwordShort;
  if (next === current) return rules.passwordSame;
  if (next !== confirm) return rules.passwordMismatch;
  return null;
}

export const emailError = (value: string): string | null => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : rules.emailInvalid);

/** Stufe nach Level wie v1 getLevelTier: Bronze 1–20, Silber 21–40, Gold 41–60, Platin 61–80, Diamant ab 81. */
export function tierOf(level: number): TierLevel {
  if (level >= 81) return "diamond";
  if (level >= 61) return "platinum";
  if (level >= 41) return "gold";
  if (level >= 21) return "silver";
  return "bronze";
}

/** Vodafone-Monate 1–4 gelten als Junior, danach regulär (v1 ProfileView). */
export const isJuniorMonth = (month: number): boolean => month >= 1 && month <= 4;

/** Team-Lizenzen und Abo verwalten nur Teamleiter und Admin (v1 Team-Lizenzierung im Menü). */
export const canManageLicenses = (role: string): boolean => role === "teamleiter" || role === "admin";
