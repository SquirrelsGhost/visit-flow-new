import { z } from "zod";

/**
 * Login-Eingabe. Bewusst nur Länge statt strenger E-Mail-Prüfung: Ein ungewöhnliches
 * Alt-Konto aus v1 soll die gleiche generische Fehlermeldung bekommen wie jeder andere Fehlversuch.
 */
export const loginInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().min(3).max(254),
    password: z.string().min(1).max(200),
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;
