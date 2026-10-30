/** Prüfungen der Registrierung, Meldungen wortgleich aus v1 (utils/validation.ts) + Wegwerf-E-Mail-Sperre. */

import { istWegwerfEmail } from "../sicherheit/emailSchutz";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME = { min: 2, max: 50 } as const;

/** Vodafone-Teams brauchen eine bestätigte Firmenadresse dieser Domain. */
export const COMPANY_DOMAIN = "@vertriebspartner-vfkd.de";

export const CODE_LENGTH = 6;

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Name ist erforderlich";
  if (trimmed.length < NAME.min) return "Name muss mindestens 2 Zeichen lang sein";
  if (trimmed.length > NAME.max) return "Name darf maximal 50 Zeichen lang sein";
  if (trimmed.split(/\s+/).length < 2) return "Bitte geben Sie Vor- und Nachname ein (durch Leerzeichen getrennt)";
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "E-Mail-Adresse ist erforderlich";
  if (!EMAIL_REGEX.test(trimmed)) return "Bitte geben Sie eine gültige E-Mail-Adresse ein";
  if (istWegwerfEmail(trimmed)) {
    return "Wegwerf- und temporäre E-Mail-Adressen sind nicht erlaubt. Bitte nutzen Sie Ihre echte E-Mail-Adresse.";
  }
  return null;
}

export function validatePasswordConfirmation(password: string, confirm: string): string | null {
  if (!confirm.trim()) return "Passwort-Bestätigung ist erforderlich";
  if (password !== confirm) return "Passwörter stimmen nicht überein";
  return null;
}

export function isCompanyEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(COMPANY_DOMAIN);
}

/** Nur Ziffern, höchstens sechs (Verifizierungscode). */
export function cleanCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, CODE_LENGTH);
}
