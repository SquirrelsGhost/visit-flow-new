/** Passwortstärke wie v1 (utils/validation.ts validatePassword), ohne Entropie-Popover. */

export type PasswordStrength = "weak" | "fair" | "good" | "strong" | "excellent";

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  noCommonPatterns: boolean;
}

export interface PasswordCheck {
  strength: PasswordStrength;
  /** 0 bis 5 erfüllte Grundregeln. */
  score: number;
  requirements: PasswordRequirements;
  isValid: boolean;
}

const MIN_LENGTH = 8;
const COMMON = ["password", "123456", "qwerty", "abc123", "admin", "letmein", "welcome", "monkey", "1234567890"];
const SEQUENCES = ["123", "234", "345", "456", "567", "678", "789", "890", "abc", "bcd", "cde", "def", "qwe", "wer", "ert", "rty"];

function hasCommonPattern(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON.some((word) => lower.includes(word)) || SEQUENCES.some((seq) => lower.includes(seq)) || /(.)\1{2,}/.test(password);
}

function entropy(password: string): number {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
  return charset ? password.length * Math.log2(charset) : 0;
}

export function checkPassword(password: string): PasswordCheck {
  const requirements: PasswordRequirements = {
    minLength: password.length >= MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noCommonPatterns: !hasCommonPattern(password),
  };
  const score = [
    requirements.minLength,
    requirements.hasUppercase,
    requirements.hasLowercase,
    requirements.hasNumbers,
    requirements.hasSpecialChars,
  ].filter(Boolean).length;
  const strength: PasswordStrength =
    score <= 2 ? "weak" : score === 3 ? "fair" : score === 4 ? "good" : password.length > 12 && entropy(password) > 80 ? "excellent" : "strong";
  return { strength, score, requirements, isValid: score >= 4 && requirements.minLength };
}

export const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: "Schwach",
  fair: "Ausreichend",
  good: "Gut",
  strong: "Stark",
  excellent: "Exzellent",
};

export const REQUIREMENT_LABELS: Record<keyof PasswordRequirements, string> = {
  minLength: "Mindestens 8 Zeichen",
  hasUppercase: "Großbuchstaben (A-Z)",
  hasLowercase: "Kleinbuchstaben (a-z)",
  hasNumbers: "Zahlen (0-9)",
  hasSpecialChars: "Sonderzeichen (!@#$%^&*)",
  noCommonPatterns: "Keine häufigen Muster",
};
