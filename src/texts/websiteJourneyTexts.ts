/**
 * Texte der Reise durchs Revier. Jede Station erscheint in ihrem Abschnitt des Scrollfortschritts
 * (siehe lib/website/revier/journeyTimeline.ts). Wörter in *Sternchen* werden kursiv in Serifenschrift gesetzt.
 */
export interface JourneyStation {
  key: string;
  from: number;
  to: number;
  /** Uhrzeit im Tagesablauf, groß über dem Titel. */
  time: string;
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
  scroll: "Scroll durch einen Tag an der Tür",
} as const;

export const journeyTexts = {
  sceneLabel: "Im Bild:",
} as const;

export const journeyStations: readonly JourneyStation[] = [
  {
    key: "revier",
    from: 0.085,
    to: 0.165,
    time: "08:45",
    kicker: "Ankommen",
    title: "Du weißt, wo du *heute klingelst.*",
    text: "Noch im Auto zeigt dir die Karte dein Revier: wo du schon warst, was offen ist und wo dein Kollege unterwegs ist.",
    scene: "Rot umrandet ist dein Revier, violett das deines Kollegen.",
    chips: ["Neue Karte mit Lasso", "Straßenlisten", "Reviere im Team"],
  },
  {
    key: "doors",
    from: 0.18,
    to: 0.27,
    time: "09:10",
    kicker: "Erste Tür",
    title: "Klingeln. Antippen. *Weiter.*",
    text: "Nicht da, kein Interesse, Termin: ein Tipp, und der Status hängt an der Tür. Kein Zettel, keine Liste am Abend.",
    scene: "Der rote Punkt bist du. Jede besuchte Tür leuchtet in ihrer Farbe.",
  },
  {
    key: "sale",
    from: 0.28,
    to: 0.36,
    time: "11:32",
    kicker: "Erster Abschluss",
    title: "Ja an der Tür. *Auftrag im CRM.*",
    text: "Der Kunde unterschreibt am Handy, der Auftrag liegt sofort im CRM. Abends tippst du nichts mehr ab.",
    scene: "Grüner Lichtstrahl heißt Abschluss. Er landet sofort als Auftrag im CRM.",
    chips: ["CRM", "Telco-Formulare", "Provisionssimulator"],
  },
  {
    key: "coach",
    from: 0.37,
    to: 0.455,
    time: "15:40",
    kicker: "Kleines Tief",
    title: "Enes *holt dich* zurück.",
    text: "Enes kennt deine Türen und Zahlen. Er sieht, dass bei dir nachmittags Mehrfamilienhäuser besser laufen, und schlägt die nächste Straße vor. Kundennamen bekommt er nie.",
    scene: "Die violette Kugel an deiner Seite ist Enes, dein KI-Coach.",
    chips: ["Mit Gedächtnis", "Spracheingabe", "Ja, mach"],
  },
  {
    key: "team",
    from: 0.48,
    to: 0.59,
    time: "17:00",
    kicker: "Blick aufs Team",
    title: "Dein Team. *Ein Blick.*",
    text: "Als Teamleiter siehst du, wer heute verkauft hat, prüfst jeden Sale und fängst Stornos früh ab. Nebenbei läuft das Duell um den Tagessieg.",
    scene: "Die farbigen Punkte sind deine Kollegen. Ihre Türen leuchten live mit.",
    chips: ["Team-Backoffice · Add-on", "Teamleistung", "Team-Battles"],
  },
  {
    key: "drive",
    from: 0.615,
    to: 0.71,
    time: "18:15",
    kicker: "Feierabend",
    title: "Kilometer? *Schon erledigt.*",
    text: "Deine Anfahrt von heute früh steht schon als Vorschlag im Fahrtenbuch. Bestätigen, fertig. Der Finanzamt-Check findet Lücken, der Export geht als PDF oder CSV.",
    scene: "Die Spur ist deine Anfahrt von heute früh. Das Fahrtenbuch hat sie mitgeschrieben.",
  },
  {
    key: "shield",
    from: 0.735,
    to: 0.83,
    time: "Rund um die Uhr",
    kicker: "Sicherheit",
    title: "Deine Kunden. *Gut geschützt.*",
    text: "Während du schläfst, bleiben alle Kundendaten verschlüsselt und bei euch. Admins behalten im Security-Dashboard Logins, Sitzungen und das Protokoll im Blick.",
    scene: "Die grüne Kuppel steht für den Schutz aller Daten im Revier.",
    chips: ["Security-Dashboard", "CRM-Übersicht", "Auslaufende Tarife"],
  },
];

export const journeyFinale = {
  from: 0.88,
  title: "Bald für alle.",
  accent: "*Bleib dran.*",
  lead: "So sieht dein Tag mit dem großen Update aus. Es ist fast fertig. Du nutzt Visit Flow schon? Dann bekommst du alles automatisch.",
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
