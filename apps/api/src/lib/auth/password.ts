import bcrypt from "bcryptjs";

// Fester Vergleichs-Hash: Auch bei unbekannter E-Mail läuft ein bcrypt-Vergleich,
// damit die Antwortzeit nicht verrät, ob ein Konto existiert (wie v1, Pentest M-1).
const DUMMY_HASH = bcrypt.hashSync("vf-dummy-password-to-equalize-timing", 10);

/** Prüft ein Passwort gegen einen bcrypt-Hash aus v1 ($2a$/$2b$). Ohne Hash wird trotzdem gerechnet. */
export async function verifyPassword(password: string, hash: string | undefined): Promise<boolean> {
  const matches = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return hash !== undefined && matches;
}
