/**
 * Texte der Reise durchs Revier. Jede Station erscheint in ihrem Abschnitt des Scrollfortschritts
 * (siehe lib/website/revier/journeyTimeline.ts). Wörter in *Sternchen* werden kursiv in Serifenschrift gesetzt.
 */
export interface JourneyStation {
  key: string;
  from: number;
  to: number;
  index?: string;
  kicker: string;
  title: string;
  text: string;
  /** Was gerade im Bild passiert, in einfachen Worten. Steht über dem Titel, damit man die Szene versteht. */
  scene: string;
  chips?: readonly string[];
}

export const journeyHero = {
  badge: "Das große Update kommt bald",
  titleTop: "Weniger Zettel.",
  titleBottom: "Mehr *Abschlüsse.*",
  lead: "CRM, KI-Coach und Backoffice in der App, die du an der Tür eh in der Hand hast.",
  scroll: "Scroll und flieg ins Revier",
} as const;

export const journeyTexts = {
  sceneLabel: "Im Bild:",
} as const;

export const journeyStations: readonly JourneyStation[] = [
  {
    key: "revier",
    from: 0.085,
    to: 0.165,
    kicker: "Dein Revier",
    title: "Jede Tür. Jede Straße. *Live.*",
    text: "Die neue Karte zeigt dein Gebiet so, wie du es draußen erlebst: wer wo war, was dort lief, was noch offen ist.",
    scene: "Rot umrandet ist dein Revier, violett das deines Kollegen.",
    chips: ["Neue Karte mit Lasso", "Straßenlisten", "Reviere im Team"],
  },
  {
    key: "doors",
    from: 0.18,
    to: 0.27,
    index: "01",
    kicker: "Für Vertriebler",
    title: "Klingeln. Antippen. *Weiter.*",
    text: "Termin, Abschluss, kein Interesse, nicht angetroffen. Der Status bleibt an der Tür, für dich und dein Team.",
    scene: "Der rote Punkt bist du. Jede besuchte Tür leuchtet in ihrer Farbe.",
  },
  {
    key: "sale",
    from: 0.28,
    to: 0.36,
    index: "02",
    kicker: "Eingebautes CRM",
    title: "Verkauf an der Tür. *Auftrag im CRM.*",
    text: "Jeder Verkauf wird von allein zum Auftrag. Stornoquote live, Vertragsübernahme am Handy unterschreiben, DSGVO-konform.",
    scene: "Grüner Lichtstrahl heißt Abschluss. Er landet sofort als Auftrag im CRM.",
    chips: ["CRM", "Telco-Formulare", "Provisionssimulator"],
  },
  {
    key: "coach",
    from: 0.37,
    to: 0.455,
    index: "03",
    kicker: "KI-Coach",
    title: "Enes geht *mit dir* raus.",
    text: "Er kennt deine Türen und Zahlen, merkt sich, was dich weiterbringt, und öffnet jede Seite auf Zuruf. Kundennamen bekommt er nie.",
    scene: "Die violette Kugel an deiner Seite ist Enes, dein KI-Coach.",
    chips: ["Mit Gedächtnis", "Spracheingabe", "Ja, mach"],
  },
  {
    key: "team",
    from: 0.48,
    to: 0.59,
    index: "04",
    kicker: "Für Teamleiter",
    title: "Dein Team. *Ein Blick.*",
    text: "Im Team-Backoffice prüfst du jeden Sale und fängst Stornos früh ab. Dazu Team-Übersicht, Teamleistung und Battles mit Duellen und Streaks.",
    scene: "Die farbigen Punkte sind deine Kollegen. Ihre Türen leuchten live mit.",
    chips: ["Team-Backoffice · Add-on", "Teamleistung", "Team-Battles"],
  },
  {
    key: "drive",
    from: 0.615,
    to: 0.71,
    index: "05",
    kicker: "Fahrtenbuch",
    title: "Jeder Kilometer. *Sauber fürs Amt.*",
    text: "Die Fahrt kommt als Vorschlag aus deinem Tag. Der Finanzamt-Check findet Lücken, der Export geht als PDF oder CSV.",
    scene: "Deine Fahrt ins Revier zeichnet sich als Spur. Das Fahrtenbuch schreibt mit.",
  },
  {
    key: "shield",
    from: 0.735,
    to: 0.83,
    index: "06",
    kicker: "Für Admins",
    title: "Alles im Griff. *Alles geschützt.*",
    text: "Security-Dashboard, CRM-Übersicht aller Verkäufe und auslaufende Tarife. Kundendaten bleiben, wo sie hingehören.",
    scene: "Die grüne Kuppel steht für den Schutz aller Daten im Revier.",
    chips: ["Security-Dashboard", "CRM-Übersicht", "Auslaufende Tarife"],
  },
];

export const journeyFinale = {
  from: 0.88,
  title: "Bald für alle.",
  accent: "*Bleib dran.*",
  lead: "Das große Update ist fast fertig. Du nutzt Visit Flow schon? Dann bekommst du alles automatisch.",
  soon: "Demnächst",
  live: "Team starten",
  login: "Anmelden",
} as const;

/** Schwebende Beschriftungen an Läufer, Revieren, Enes, Kollegen, Auto und Kuppel. */
export const journeyLabels = {
  sale: "Auftrag angelegt",
  saleSub: "Glasfaser 500 · im CRM",
  coach: "Nachmittags läuft es bei dir besser. Mehrfamilienhäuser nach 16 Uhr?",
  car: "Dienstfahrt",
  carSub: "Vorschlag aus deinem Tag",
  shield: "Geschützt",
  team: ["Duell läuft", "Sale bestätigt", "Neue Serie"],
  me: "Du",
  meSub: "von Tür zu Tür",
  ownArea: "Dein Revier",
  otherArea: "Revier vom Kollegen",
  legend: [
    { label: "Abschluss", color: "#22c55e" },
    { label: "Termin", color: "#3b82f6" },
    { label: "Kein Interesse", color: "#ef4444" },
    { label: "Nicht angetroffen", color: "#9aa6b8" },
    { label: "Versorgt", color: "#06b6d4" },
  ],
} as const;
