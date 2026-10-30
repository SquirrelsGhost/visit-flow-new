import { Calculator, Database, HandCoins, Landmark, ThermometerSun } from "lucide-react";
import type { PrepareOption } from "./hotline";
import type { ImportantLink } from "./importantLinks";

/** Anlaufstellen rund um PV, unabhängig vom Lead-Partner. */
export const SOLAR_LINKS: readonly ImportantLink[] = [
  { id: "so1", icon: Calculator, title: "Ertrag rechnen", description: "PVGIS: Solarertrag für jede Adresse", url: "https://re.jrc.ec.europa.eu/pvg_tools/de/", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
  { id: "so2", icon: Database, title: "Marktstammdaten", description: "Register für PV-Anlagen und Speicher", url: "https://www.marktstammdatenregister.de/", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
  { id: "so3", icon: Landmark, title: "BNetzA", description: "Bundesnetzagentur: aktuelle Einspeisevergütung", url: "https://www.bundesnetzagentur.de/", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" },
  { id: "so4", icon: HandCoins, title: "KfW", description: "Kredite und Förderung für PV & Speicher", url: "https://www.kfw.de/", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
  { id: "so5", icon: ThermometerSun, title: "BAFA", description: "Förderung für Wärmepumpen", url: "https://www.bafa.de/", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" },
];

/** Lead-Check: was vor dem Eintragen geklärt sein muss, damit der Lead netto bleibt. */
export const SOLAR_LEAD_CHECK: readonly PrepareOption[] = [
  { mark: "1", strong: "Eigentümer", rest: ": Das Haus gehört dem Kunden (keine Mieter)" },
  { mark: "2", strong: "Dach", rest: ": Ausrichtung, Verschattung, Alter oder geplante Sanierung" },
  { mark: "3", strong: "Verbrauch", rest: ": Stromkosten im Monat, Wärmepumpe oder E-Auto vorhanden oder geplant" },
  { mark: "4", strong: "Termin", rest: ": fester Termin, beide Entscheider sind dabei" },
  { mark: "!", strong: "Fehlt etwas?", rest: " Erst nachfragen, dann eintragen. Unklare Leads werden oft storniert.", fallback: true },
];
