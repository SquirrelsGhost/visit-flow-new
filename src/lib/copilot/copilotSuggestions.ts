import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Role } from "@/shared/auth/roles";
import type { Vertical } from "../battle/battleCategories";
import { hasAnyRole } from "../navigation/userMenuItems";

const MAX = 4;
const LEAD_ROLES: readonly Role[] = ["admin", "gebietsmanager", "teamleiter", "strukturleiter", "mentor"];

/** Einwände und Fragen an der Tür je Sparte. */
const BY_VERTICAL: Record<Vertical, readonly string[]> = {
  telco: ["Kunde sagt: zu teuer", "Kunde will erst mit dem Partner sprechen", "Wie erkläre ich GigaKombi?", "Keine Zeit an der Tür"],
  energy: ["Kunde sagt: Ich bin bei den Stadtwerken zufrieden", "Was brauche ich für den Auftrag?", "Wie schätze ich den Verbrauch?", "Preisgarantie erklären"],
  solar: ["Kunde sagt: lohnt sich nicht", "Wann ist ein Lead gut?", "Dach ist zu alt", "Kunde will nur Infos"],
};

/** Fragen, die zur gerade offenen Seite passen. Längster passender Pfad gewinnt. */
const BY_PATH: readonly { path: string; prompts: readonly string[] }[] = [
  { path: "/statistics", prompts: ["Wie mache ich einen Pencil Sell?"] },
  { path: "/crm", prompts: ["Wie senke ich meine Stornoquote?"] },
  { path: "/abrechnung", prompts: ["Wie reiche ich eine Reklamation ein?"] },
  { path: "/battle", prompts: ["Gib mir Motivation für das Battle"] },
  { path: "/dashboard", prompts: ["Tipps für die nächste Straße"] },
];

/** Für Führungsrollen. */
const LEAD_PROMPT = "Wie motiviere ich mein Team heute?";

/**
 * Vorschläge im leeren Chat (v1 hatte keine): erst zur Seite, dann für Führungsrollen,
 * dann zur Sparte, ohne Doppelte, höchstens vier.
 */
export function copilotSuggestions(pathname: string, vertical: Vertical, user: AuthUser | null): string[] {
  const page = BY_PATH.filter((entry) => pathname.startsWith(entry.path)).sort((a, b) => b.path.length - a.path.length)[0];
  const lead = user && hasAnyRole(user, LEAD_ROLES) ? [LEAD_PROMPT] : [];
  const all = [...(page?.prompts ?? []), ...lead, ...BY_VERTICAL[vertical]];
  return [...new Set(all)].slice(0, MAX);
}
