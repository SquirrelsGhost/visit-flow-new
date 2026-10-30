/** Texte, wenn Enes die App bedient: Knöpfe, Bestätigungskarten und Rückmeldungen. */
const PAGES: Record<string, string> = {
  map: "Karte",
  statistics: "Rechner",
  crm: "Aufträge",
  abrechnung: "Abrechnung",
  simulator: "Provisions-Simulator",
  battle: "Battle",
  overview: "Übersicht",
  assistant: "Assistent",
  "my-teams": "Meine Teams",
  "team-performance": "Teamleistung",
  "daily-status": "Tagesstatus",
  profile: "Profil",
  settings: "Einstellungen",
};

const DAY_STATUS: Record<string, string> = { active: "Wieder aktiv", sick: "Krank melden", inactive: "Frei / Urlaub eintragen" };

const day = (iso: string) => {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
};

export const copilotToolTexts = {
  pageLabel: (page: string) => PAGES[page] ?? page,
  calculator: "Rechner",
  simulator: "Provisions-Simulator",
  street: (street: string) => `${street} auf der Karte`,
  working: "Enes schaut in der App nach …",
  appointmentTitle: (date: string, time: string) => `Termin ${day(date)} um ${time} Uhr`,
  dayStatusTitle: (status: string) => DAY_STATUS[status] ?? status,
  range: (start: string, end: string) => (start === end ? day(start) : `${day(start)} bis ${day(end)}`),
  today: "ab heute",
  challengeTitle: "Battle-Herausforderung an",
  confirm: "Ja, mach",
  cancel: "Abbrechen",
  saving: "Speichere …",
  saved: "Gespeichert",
  challengeSent: "Herausforderung gesendet",
  cancelled: "Abgebrochen",
  failed: "Hat nicht geklappt. Versuch es über die Seite.",
  notPossible: "Das geht so nicht.",
  badDate: "Datum oder Uhrzeit fehlen.",
  noDoor: "Keine passende Tür gefunden. Öffne die Tür auf der Karte oder nenne Straße und Hausnummer.",
  noColleague: (name: string) => `Niemand namens ${name} im Team gefunden.`,
  opened: "geöffnet",
  notAllowed: "nicht verfügbar für diesen Nutzer",
  awaitingConfirm: "dem Berater zur Bestätigung angezeigt, noch nicht gespeichert",
};
