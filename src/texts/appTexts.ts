import { isRole, type Role } from "@/shared/auth/roles";

/** Texte des App-Rahmens (Topbar, Menü, Platzhalter), wie in v1. */
const ROLE_LABELS: Record<Role, string> = {
  berater: "Berater",
  mentor: "Mentor",
  strukturleiter: "Strukturleiter",
  teamleiter: "Teamleiter",
  gebietsmanager: "Gebietsmanager",
  admin: "Administrator",
};

/** Anzeigename einer Rolle wie formatSingleRole in v1; Unbekanntes bleibt wie es ist. */
export const roleLabel = (role: string): string => (isRole(role) ? ROLE_LABELS[role] : role);

export const shellTexts = {
  mainNav: "Hauptnavigation unten",
  pendingTitle: "Kommt gleich",
  pendingBody: "Dieser Bereich wird gerade aus der bisherigen App übernommen.",
  backToMap: "Zur Karte",
  verticalSwitch: "Sparte wechseln",
} as const;

export const mapTexts = {
  satellite: "Sat",
  streets: "Karte",
  switchStyle: "Kartenstil wechseln",
  locate: "Mein Standort / folgen",
  following: "Folgen aus",
  failedTitle: "Karte konnte nicht geladen werden",
  failedWebgl:
    "Dieses Gerät blockiert gerade die Kartendarstellung (WebGL). Bitte Stromspar- und Lockdown-Modus für Safari deaktivieren und nicht benötigte Tabs schließen – oder unten auf „Karte reparieren“ tippen.",
  failedInit: "Die Karte konnte nicht initialisiert werden. Ein Tap auf „Karte reparieren“ lädt sie frisch.",
  noToken: "Für die Karte fehlt der Mapbox-Schlüssel (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local).",
  reload: "Neu laden",
  repair: "Karte reparieren",
  repairing: "Wird repariert…",
} as const;
