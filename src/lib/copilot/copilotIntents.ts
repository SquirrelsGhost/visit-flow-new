import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Vertical } from "../battle/battleCategories";
import { HOME_HREF } from "../navigation/navItems";
import { availableNavTargets } from "../navigation/navTargets";
import { normalize, tokensOf, wordHits } from "./copilotMatch";
import type { CopilotAction } from "./copilotTypes";

interface PageIntent {
  /** Id aus NAV_TARGETS (Rechte und Sparte gelten mit); "map" ist die Startseite. */
  id: string;
  label: string;
  keywords: readonly string[];
}

/** Seiten, die Enes per Wort öffnen kann. Stichworte bereits normalisiert (ae/oe/ue). */
const PAGE_INTENTS: readonly PageIntent[] = [
  { id: "map", label: "die Karte", keywords: ["karte", "map", "haeuser", "tracking", "revier", "gebiet"] },
  { id: "statistics", label: "den Rechner", keywords: ["rechner", "tarifrechner", "vergleich", "pencil", "rechnen", "taschenrechner"] },
  { id: "crm", label: "deine Aufträge", keywords: ["auftraege", "auftrag", "storno", "stornoquote", "crm", "vertraege"] },
  { id: "abrechnung", label: "die Abrechnung", keywords: ["abrechnung", "reklamation", "reklamationen", "auszahlung"] },
  { id: "simulator", label: "den Provisions-Simulator", keywords: ["simulator", "provision", "provisionen", "verdienst", "gehalt"] },
  { id: "battle", label: "das Battle", keywords: ["battle", "duell", "herausforderung", "arena"] },
  { id: "overview", label: "die Übersicht", keywords: ["uebersicht", "tagesbilanz", "gewinnspiel", "verwaltung"] },
  { id: "assistant", label: "den Assistenten", keywords: ["assistent", "wissensdatenbank", "hotline", "links", "portal", "portale"] },
  { id: "my-teams", label: "deine Teams", keywords: ["teams", "struktur", "mentees", "baum"] },
  { id: "team-performance", label: "die Teamleistung", keywords: ["teamleistung", "rangliste", "leistung"] },
  { id: "daily-status", label: "den Tagesstatus", keywords: ["tagesstatus", "krank", "urlaub", "anwesenheit"] },
  { id: "licensing", label: "die Team-Lizenzen", keywords: ["lizenz", "lizenzen", "lizenzierung"] },
  { id: "profile", label: "dein Profil", keywords: ["profil", "level", "erfolge"] },
  { id: "settings", label: "die Einstellungen", keywords: ["einstellungen", "settings", "dunkelmodus", "sounds"] },
];

/** Verben, mit denen jemand eine Seite haben will. */
const OPEN_WORDS = ["oeffne", "oeffnen", "zeig", "zeige", "geh", "gehe", "bring", "wechsel", "wechsle", "navigier", "navigiere", "starte", "wo"];

function hrefFor(id: string, user: AuthUser | null, vertical: Vertical): string | null {
  if (id === "map") return HOME_HREF;
  return availableNavTargets(user, vertical).find((target) => target.id === id)?.href ?? null;
}

function bestPage(tokens: readonly string[]): PageIntent | null {
  let best: PageIntent | null = null;
  let bestHits = 0;
  for (const intent of PAGE_INTENTS) {
    const hits = tokens.filter((token) => intent.keywords.some((keyword) => wordHits(token, keyword))).length;
    if (hits > bestHits) {
      best = intent;
      bestHits = hits;
    }
  }
  return best;
}

/**
 * Erkennt "öffne den Rechner", "wo sind meine Aufträge" oder nur "Abrechnung" und liefert das Ziel,
 * sofern der Nutzer die Seite in dieser Sparte sehen darf. Ohne Öffnen-Wort nur bei sehr kurzen Eingaben.
 */
export function pageIntent(text: string, user: AuthUser | null, vertical: Vertical): CopilotAction | null {
  const words = normalize(text).split(" ");
  const wantsOpen = words.some((word) => OPEN_WORDS.includes(word));
  const tokens = tokensOf(text);
  if (!wantsOpen && tokens.length > 2) return null;
  const page = bestPage(tokens);
  if (!page) return null;
  const href = hrefFor(page.id, user, vertical);
  return href ? { label: page.label, href } : null;
}
