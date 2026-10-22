import { useCallback, useState } from "react";
import { loginTexts } from "../texts/loginTexts";

export type LoginField = "emailOrName" | "password";
type FieldErrors = Partial<Record<LoginField, string>>;

/** Pflichtfeld-Prüfung wie v1 validateLoginCredentials. */
export function validateLogin(emailOrName: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!emailOrName.trim()) errors.emailOrName = loginTexts.emailOrNameRequired;
  if (!password.trim()) errors.password = loginTexts.passwordRequired;
  return errors;
}

/** Feldfehler erscheinen erst nach dem Verlassen des Feldes oder beim Absenden. */
export function useLoginValidation() {
  const [errors, setErrors] = useState<FieldErrors>({});

  const checkField = useCallback((field: LoginField, emailOrName: string, password: string) => {
    const message = validateLogin(emailOrName, password)[field];
    setErrors((current) => ({ ...current, [field]: message }));
  }, []);

  const clearField = useCallback((field: LoginField) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }, []);

  /** Prüft alle Felder, zeigt die Fehler und meldet, ob abgeschickt werden darf. */
  const checkAll = useCallback((emailOrName: string, password: string) => {
    const found = validateLogin(emailOrName, password);
    setErrors(found);
    return Object.keys(found).length === 0;
  }, []);

  const hasErrors = Object.values(errors).some(Boolean);
  return { errors, hasErrors, checkField, clearField, checkAll };
}
