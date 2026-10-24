/**
 * Werkzeuge, mit denen Enes die App bedient. Die App führt sie aus (mit den Rechten und der Sparte
 * des Nutzers), die API reicht nur Beschreibung und Aufruf an das Modell weiter.
 * - "read": liest Kennzahlen, das Ergebnis geht zurück an Enes (nie Kundennamen oder Kontaktdaten)
 * - "open": öffnet sofort etwas in der App
 * - "confirm": speichert etwas; die App fragt den Nutzer vorher mit "Ja, mach"
 */
export type CopilotToolKind = "read" | "open" | "confirm";

interface JsonSchema {
  type: "object";
  properties: Record<string, Record<string, unknown>>;
  required?: string[];
}

export interface CopilotToolSpec {
  kind: CopilotToolKind;
  description: string;
  parameters: JsonSchema;
}

const none: JsonSchema = { type: "object", properties: {} };
const date = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "YYYY-MM-DD, aus HEUTE berechnet" };

export const COPILOT_PAGES = ["map", "statistics", "crm", "abrechnung", "simulator", "battle", "overview", "assistant", "my-teams", "team-performance", "daily-status", "profile", "settings"] as const;

export const COPILOT_TOOLS = {
  get_today: {
    kind: "read",
    description: "Zahlen des Beraters heute und diese Woche: Türen, angetroffen, Gespräche, Abschlüsse, Produkte, beste Uhrzeit.",
    parameters: none,
  },
  get_open_doors: {
    kind: "read",
    description: "Offene Chancen der letzten 28 Tage je Straße: Wiedervorlagen, nicht angetroffen, letzter Besuch. Für Routen-Tipps.",
    parameters: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 10 } } },
  },
  get_appointments: {
    kind: "read",
    description: "Anstehende Termine und Wiedervorlagen des Beraters: Datum, Uhrzeit, Straße (ohne Hausnummer).",
    parameters: { type: "object", properties: { days: { type: "integer", minimum: 1, maximum: 14 } } },
  },
  get_orders: {
    kind: "read",
    description: "Aufträge: Anzahl offen, abgeschlossen, storniert, Stornoquote und häufigste Produkte im Zeitraum.",
    parameters: { type: "object", properties: { days: { type: "integer", enum: [7, 30, 90] } } },
  },
  get_expiring: {
    kind: "read",
    description: "Auslaufende Kundenverträge: Anzahl je Woche und nächste Fälligkeiten (ohne Namen).",
    parameters: { type: "object", properties: { weeks: { type: "integer", minimum: 1, maximum: 12 } } },
  },
  get_earnings: {
    kind: "read",
    description: "Provision: geschätzte Provision diesen Monat aus den Aufträgen, Storno-Puffer und Monatsziel.",
    parameters: none,
  },
  find_tariff: {
    kind: "read",
    description: "Tarife der Sparte suchen: Name, Monatspreis, Laufzeit, Aktion. Für Preisfragen und Vergleiche.",
    parameters: { type: "object", properties: { query: { type: "string", maxLength: 60 } }, required: ["query"] },
  },
  get_battle: {
    kind: "read",
    description: "Battle-Stand: Rang, laufende Duelle, Serie, offene Herausforderungen.",
    parameters: none,
  },
  get_team_today: {
    kind: "read",
    description: "Nur für Führungskräfte: Team heute, je Mitglied Vorname, Tagesstatus, Türen und Abschlüsse.",
    parameters: none,
  },
  open_page: {
    kind: "open",
    description: "Eine Seite der App öffnen, wenn der Berater dorthin will oder sie für die Aufgabe braucht.",
    parameters: { type: "object", properties: { page: { type: "string", enum: [...COPILOT_PAGES] } }, required: ["page"] },
  },
  open_calculator: {
    kind: "open",
    description: "Tarifrechner (Pencil Sell) öffnen, optional mit altem Monatspreis des Kunden und gesuchtem Tarif vorausgefüllt.",
    parameters: { type: "object", properties: { oldPrice: { type: "number", minimum: 0, maximum: 500 }, tariff: { type: "string", maxLength: 60 } } },
  },
  show_street: {
    kind: "open",
    description: "Karte auf eine Straße fahren und ihre offenen Türen zeigen.",
    parameters: { type: "object", properties: { street: { type: "string", maxLength: 80 } }, required: ["street"] },
  },
  open_simulator: {
    kind: "open",
    description: "Provisions-Simulator öffnen, um ein Monatsziel durchzurechnen.",
    parameters: none,
  },
  schedule_appointment: {
    kind: "confirm",
    description:
      "Termin oder Wiedervorlage anlegen (\"erinner mich morgen um 18 Uhr an die Tür\"). Die Tür ordnet die App selbst zu, aus der Nachricht des Beraters oder der zuletzt besuchten Tür; nenne keine Adresse.",
    parameters: {
      type: "object",
      properties: { date, time: { type: "string", pattern: "^\\d{2}:\\d{2}$" }, note: { type: "string", maxLength: 200 } },
      required: ["date", "time"],
    },
  },
  set_day_status: {
    kind: "confirm",
    description: "Tagesstatus des Beraters setzen: active (wieder da), sick (krank), inactive (Urlaub/frei).",
    parameters: { type: "object", properties: { status: { type: "string", enum: ["active", "sick", "inactive"] }, until: date }, required: ["status"] },
  },
  challenge_colleague: {
    kind: "confirm",
    description: "Einen Kollegen per Vorname zum Battle herausfordern.",
    parameters: { type: "object", properties: { name: { type: "string", maxLength: 40 } }, required: ["name"] },
  },
} as const satisfies Record<string, CopilotToolSpec>;

export type CopilotToolName = keyof typeof COPILOT_TOOLS;
export const COPILOT_TOOL_NAMES = Object.keys(COPILOT_TOOLS) as [CopilotToolName, ...CopilotToolName[]];
