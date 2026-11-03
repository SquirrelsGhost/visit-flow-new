export interface D2dIndustryFaq {
  question: string;
  answer: string;
}

export interface D2dIndustryEntry {
  slug: string;
  name: string;
  shortLabel: string;
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  avgCommissionEur: string;
  avgConversionRate: string;
  avgDoorsPerDay: string;
  stornoReduction: string;
  painPoints: string[];
  solutions: {
    title: string;
    detail: string;
  }[];
  objectionPlaybook: {
    objection: string;
    counter: string;
  }[];
  faqs: D2dIndustryFaq[];
}

export const D2D_INDUSTRIES: readonly D2dIndustryEntry[] = [
  {
    slug: "glasfaser",
    name: "Glasfaser & FTTH-Vorvermarktung",
    shortLabel: "Glasfaser (FTTH)",
    badge: "FTTH-Vorvermarktung & Nachverdichtung",
    heroTitle: "Die #1 D2D-Software für Glasfaser-Vertrieb & FTTH-Quoten",
    heroSubtitle:
      "Knacke die 40%-Vorvermarktungsquote schneller: Echtzeit-Polygone auf Hausnummernebene, WE-Tracking in Mehrfamilienhäusern, Gestattungsverträge (GEE) und automatische Abend-Wiedervorlagen.",
    metaTitle: "D2D Software Glasfaser & FTTH-Vorvermarktung (ab 140 € Provision/Auftrag) | Visit Flow",
    metaDescription:
      "Glasfaser-Direktvertrieb mit System: WE-genaue Lauflisten, Live-Quoten-Tracking, Gestattungsverträge & automatische Provisionsabrechnung für FTTH-Teams.",
    keywords: [
      "Glasfaser Vertrieb Software",
      "D2D Software Glasfaser",
      "FTTH Vorvermarktung App",
      "Lauflisten App Glasfaser",
      "Direktvertrieb Telekommunikation",
      "Visit Flow",
    ],
    avgCommissionEur: "140 € – 260 €",
    avgConversionRate: "14,8 %",
    avgDoorsPerDay: "75 – 110 Türen",
    stornoReduction: "-41 % Widerrufe",
    painPoints: [
      "Doppelbegehungen im Ausbaugebiet, weil Papier-Lauflisten nicht synchronisiert sind",
      "Fehlende Eigentümer-Zuordnung (GEE / Gestattungsvertrag) bei Mehrfamilienhäusern",
      "Hohe Stornoquoten durch unvollständige Anbieterwechsel-Daten (Rufnummernmitnahme / Restlaufzeit)",
    ],
    solutions: [
      {
        title: "Echtzeit-Quoten-Polygone je Ausbaucluster",
        detail:
          "Jedes Polygon zeigt live die aktuelle Vorvermarktungsquote (z. B. 34,2 % von 40 %) sowie noch offene Wohneinheiten pro Straße.",
      },
      {
        title: "WE-Matrix für Mehrfamilienhäuser & Eigentümer (GEE)",
        detail:
          "Erfasse jede Klingel einzeln (EG links bis 4. OG rechts) und verknüpfe Mieter-Vorverträge direkt mit der Hausverwaltung oder dem Eigentümer.",
      },
      {
        title: "Smart-Revisit zwischen 17:00 und 19:30 Uhr",
        detail:
          "Nicht angetroffene Haushalte werden automatisch für die Abend-Runde nach Treffer-Wahrscheinlichkeit sortiert.",
      },
    ],
    objectionPlaybook: [
      {
        objection: "„Mein aktueller Kupfer-/Kabelvertrag läuft noch 14 Monate.“",
        counter:
          "„Genau deshalb sichern wir heute nur den kostenlosen Hausanschluss (0 € statt 799 € Baukostenzuschuss). Der Tarif startet erst am Tag nach Ablauf Ihres Altvertrags – null Doppelkosten.“",
      },
      {
        objection: "„Ich bin nur Mieter, das entscheidet der Vermieter.“",
        counter:
          "„Perfekt – als Mieter lösen Sie mit Ihrer Vorbestellung den kostenlosen Ausbauimpuls aus. Wir holen die Gestattung beim Eigentümer direkt über unser Backoffice ein.“",
      },
    ],
    faqs: [
      {
        question: "Unterstützt Visit Flow alle deutschen Netzbetreiber (Telekom, Deutsche Glasfaser, OXG, 1&1)?",
        answer:
          "Ja. Du kannst beliebige Carrier-Tarife, Baukostenzuschuss-Regeln und Provisionsstaffeln hinterlegen und Gebiets-CSV-Listen pro Netzbetreiber importieren.",
      },
      {
        question: "Wie verhindert Visit Flow Doppelbegehungen im Glasfaser-Team?",
        answer:
          "Sobald ein Berater einen Tür-Status setzt, wird der Pin in unter 200 Millisekunden auf den Karten aller Teamkollegen aktualisiert.",
      },
    ],
  },
  {
    slug: "solar-photovoltaik",
    name: "Solar, Photovoltaik & Wärmepumpe",
    shortLabel: "Solar & PV",
    badge: "D2D-Scouting & Setter-Closer-Workflow",
    heroTitle: "D2D-Software für Solar-Scouting, PV-Leads & Wärmepumpen-Vertrieb",
    heroSubtitle:
      "Verwandle Einfamilienhaus-Siedlungen in hochqualifizierte Dach-Termine: Satelliten-Dachcheck, nahtlose Setter-Closer-Übergabe und Stornoreserve-Tracking bis zur Montage.",
    metaTitle: "D2D Software Solar & Photovoltaik (850 € – 1.800 € Provision/Anlage) | Visit Flow",
    metaDescription:
      "Solar-Direktvertrieb & D2D-Scouting: Qualifiziere Eigenheim-Dächer an der Haustür, buche Closer-Termine live und rechne Setter-/Closer-Provisionen sauber ab.",
    keywords: [
      "Solar D2D Software",
      "Photovoltaik Direktvertrieb App",
      "Solar Setter Closer CRM",
      "Wärmepumpe Außendienst Software",
      "Visit Flow",
    ],
    avgCommissionEur: "850 € – 1.800 €",
    avgConversionRate: "4,5 Termine/Tag",
    avgDoorsPerDay: "55 – 85 Eigenheime",
    stornoReduction: "+34 % Show-Rate",
    painPoints: [
      "Setter laufen in Straßen mit hohem Mieteranteil oder ungeeigneten Norddächern",
      "Medienbruch zwischen Haustür-Scouting (Setter) und Fachberater-Termin (Closer)",
      "Intransparente Provisions-Splits zwischen Vorschuss bei Unterschrift und Restzahlung nach AC/DC-Montage",
    ],
    solutions: [
      {
        title: "Satelliten- & Eigenheim-Gebietsfilter",
        detail:
          "Markiere reine Einfamilien- und Doppelhaus-Zonen auf der 3D-/Satellitenkarte und klammere Mietblocks vorab aus.",
      },
      {
        title: "Sofort-Terminbuchung mit Dachfoto & Stromverbrauch",
        detail:
          "Der Setter erfasst Jahresverbrauch (kWh), Dachform, Zählerschrank-Foto und bucht den Closer-Slot direkt an der Haustür.",
      },
      {
        title: "Zweistufige Setter-/Closer-Provisionsabrechnung",
        detail:
          "Automatischer Split zwischen Lead-Prämie, Abschluss-Vorschuss und Auszahlung nach Netzanschluss inkl. Stornoreserve.",
      },
    ],
    objectionPlaybook: [
      {
        objection: "„Eine PV-Anlage mit Speicher rechnet sich bei uns nicht mehr.“",
        counter:
          "„Durch 0 % Mehrwertsteuer und gesunkene Modulpreise liegt die Amortisation aktuell oft unter 8 Jahren. Unser Techniker ist morgen ohnehin in Ihrer Straße und rechnet Ihr Dach in 10 Minuten exakt durch.“",
      },
    ],
    faqs: [
      {
        question: "Können Setter und Closer im selben System arbeiten?",
        answer:
          "Ja. Setter qualifizieren die Haustür auf der Laufliste und übergeben den Termin samt Fotos, Notizen und kWh-Bedarf direkt in den Kalender des Closers.",
      },
    ],
  },
  {
    slug: "energie-strom-gas",
    name: "Energie, Strom & Gas (B2C & Gewerbe)",
    shortLabel: "Strom & Gas",
    badge: "Tarifoptimierung & Zähler-Erfassung",
    heroTitle: "D2D-Software für Strom- & Gasvertrieb mit Ablauf-Radar",
    heroSubtitle:
      "Höhere Schlagzahl und drastisch weniger Stornos im Energievertrieb: Zählernummer-Prüfung, Ersparnis-Rechner an der Tür und automatischer Wiedervorlage-Radar vor Vertragsablauf.",
    metaTitle: "D2D Software Strom & Gas – Energievertrieb CRM & Provisionsabrechnung | Visit Flow",
    metaDescription:
      "Die bewährte D2D-Software für Strom- und Gasvertrieb: Lauflisten, Zählernummer-Dokumentation, Ablauf-Radar für Folgeverträge & mehrstufige Struktur-Abrechnung.",
    keywords: [
      "Energievertrieb Software",
      "Strom Gas D2D App",
      "Haustürvertrieb Energie CRM",
      "Provisionsabrechnung Strukturvertrieb",
      "Visit Flow",
    ],
    avgCommissionEur: "65 € – 145 €",
    avgConversionRate: "16,2 %",
    avgDoorsPerDay: "80 – 120 Türen",
    stornoReduction: "< 9,5 % Stornoquote",
    painPoints: [
      "Hohe Storno- und Ablehnungsquoten durch Zahlendreher bei Zählernummer oder MaLo-ID",
      "Bestandskunden gehen nach 12 oder 24 Monaten verloren, weil kein Ablauf-Radar existiert",
      "Aufwendige Excel-Abrechnung für mehrstufige Struktur-, Teamleiter- und Qualitätsboni",
    ],
    solutions: [
      {
        title: "Automatischer Vertragsablauf-Radar (Expiring Contracts)",
        detail:
          "Visit Flow meldet auslaufende Strom- und Gasverträge automatisch 90 Tage vor Bindungsende zur Anschluss-Optimierung.",
      },
      {
        title: "Strukturleiter-Overrides & Qualitäts-Staffeln auf Knopfdruck",
        detail:
          "Berechne Eigenumsatz, Differenzprovisionen, Stornoreserve-Freigaben und PDF-Gutschriften in Sekunden statt Tagen.",
      },
    ],
    objectionPlaybook: [
      {
        objection: "„Ich habe Angst, dass ich beim Wechsel plötzlich ohne Strom dastehe.“",
        counter:
          "„Die Versorgung ist in Deutschland gesetzlich zu 100 % durch den örtlichen Netzbetreiber garantiert (§ 36 EnWG). Es ändert sich technisch kein Kabel und kein Zähler – nur der Preis auf Ihrer Abrechnung sinkt.“",
      },
    ],
    faqs: [
      {
        question: "Erinnert Visit Flow automatisch an auslaufende Strom- und Gasverträge?",
        answer:
          "Ja. Im Modul ‚Auslaufende Verträge‘ sehen Berater und Admins alle Kunden, deren Preisgarantie oder Mindestlaufzeit in Kürze endet, und können sie per Klick neu zuweisen.",
      },
    ],
  },
  {
    slug: "telekommunikation",
    name: "Telekommunikation, Kabel & TV-Umstellung",
    shortLabel: "Telco & Kabel",
    badge: "WE-Hochhaus-Matrix & Cross-Selling",
    heroTitle: "D2D-Software für Telekommunikation, Kabel-TV & Mobilfunk-Teams",
    heroSubtitle:
      "Beherrsche große Wohnanlagen und Mehrfamilienhäuser: Stockwerks-Matrix pro Aufgang, Verfügbarkeitscheck und Gamification-Leaderboards für maximale Team-Motivation.",
    metaTitle: "D2D Software Telekommunikation & Kabel-Vertrieb | Visit Flow",
    metaDescription:
      "D2D-App für Telekommunikation & Wohnungswirtschaft: Stockwerks-Tracking in Mehrfamilienhäusern, Live-Battle-Ranglisten und automatische Provisionsabrechnung.",
    keywords: [
      "Telekommunikation Vertrieb App",
      "D2D Software Kabel TV",
      "Haustürvertrieb Telekom CRM",
      "Lauflisten Mehrfamilienhaus",
      "Visit Flow",
    ],
    avgCommissionEur: "110 € – 220 €",
    avgConversionRate: "15,4 %",
    avgDoorsPerDay: "90 – 130 WE",
    stornoReduction: "+28 % Cross-Sell",
    painPoints: [
      "Unübersichtliche Zettelwirtschaft bei Wohnblocks mit 20 bis 80 Wohneinheiten je Hausnummer",
      "Kein Überblick, welcher Berater zu welcher Uhrzeit tatsächlich im Gebiet aktiv war",
    ],
    solutions: [
      {
        title: "Hochhaus- & Etagen-Tracking je Aufgang",
        detail:
          "Dokumentiere jede Wohnung einzeln mit Status (Abschluss, Wiedervorlage, Nicht geöffnet, Kein Interesse) und Uhrzeit.",
      },
      {
        title: "Live-Battles & Team-Ranglisten",
        detail:
          "Starte Tages- oder Wochen-Challenges zwischen Beratern und Standorten mit Live-Scoreboard auf dem Smartphone.",
      },
    ],
    objectionPlaybook: [
      {
        objection: "„Ich brauche kein schnelleres Internet, mir reicht mein alter Tarif.“",
        counter:
          "„Oft zahlen Bestandskunden in Alttarifen 5 bis 10 € mehr im Monat für ein Drittel der Leistung. Wir prüfen kurz Ihre aktuelle Rechnung – wenn wir Ihren Preis nicht senken oder die Leistung zum gleichen Preis verdoppeln, ändern wir nichts.“",
      },
    ],
    faqs: [
      {
        question: "Wie bildet Visit Flow große Mehrfamilienhäuser mit 50+ Parteien ab?",
        answer:
          "Unter einer Hausnummer lassen sich beliebig viele Wohneinheiten nach Etage und Türposition anlegen, sodass selbst Wohnanlagen mit 100 Parteien lückenlos abgearbeitet werden.",
      },
    ],
  },
  {
    slug: "immobilien-makler",
    name: "Immobilienmakler & Eigentümer-Farming",
    shortLabel: "Immobilien-Farming",
    badge: "Nachbarschafts-Farming & Objektakquise",
    heroTitle: "Systematisches D2D-Eigentümer-Farming für Immobilienmakler",
    heroSubtitle:
      "Gewinne mehr qualifizierte Alleinaufträge durch strukturiertes Straßenzug-Farming rund um Referenzobjekte: Eigentümer-Historie, Einwertungstermine und Follow-up-Pipeline.",
    metaTitle: "D2D Farming Software für Immobilienmakler & Objektakquise | Visit Flow",
    metaDescription:
      "Systematische D2D-Objektakquise für Immobilienmakler: Nachbarschafts-Farming rund um verkaufte Objekte, Eigentümer-Datenbank und Wiedervorlage-CRM.",
    keywords: [
      "Immobilienmakler Akquise Software",
      "D2D Farming Immobilien",
      "Objektakquise Außendienst App",
      "Eigentümer Farming CRM",
      "Visit Flow",
    ],
    avgCommissionEur: "9.500 € – 18.500 €",
    avgConversionRate: "3,4 Aufträge/Quartal",
    avgDoorsPerDay: "40 – 65 Eigentümer",
    stornoReduction: "+62 % Alleinaufträge",
    painPoints: [
      "Kaltakquise-Erfolge im Farming-Gebiet versanden, weil Verkaufsabsichten in 6–12 Monaten nicht nachgefasst werden",
      "Keine Karten-Übersicht, welche Straßenzüge rund um ein Referenzobjekt bereits angesprochen wurden",
    ],
    solutions: [
      {
        title: "Referenzobjekt-Radius & Straßenzug-Historie",
        detail:
          "Ziehe einen Farming-Radius um dein jüngst verkauftes Objekt und arbeite jede Nachbar-Adresse systematisch ab.",
      },
      {
        title: "Langzeit-Wiedervorlage für Eigentümer",
        detail:
          "Speichere Verkaufs-Signale (Ruhestand, Erbschaft, Verkleinerung) mit automatischer Wiedervorlage in 3, 6 oder 12 Monaten.",
      },
    ],
    objectionPlaybook: [
      {
        objection: "„Wir wollen aktuell nicht verkaufen.“",
        counter:
          "„Das dachte ich mir – wir haben gerade das Haus in Ihrer Nachbarschaft über Angebotspreis vermittelt, und 4 geprüfte Käuferfamilien suchen exakt in Ihrer Straße. Darf ich Ihnen unverbindlich unsere aktuelle Marktwerteinschätzung für Ihre Unterlagen dalassen?“",
      },
    ],
    faqs: [
      {
        question: "Eignet sich Visit Flow für Maklerbüros mit mehreren Akquisiteuren?",
        answer:
          "Ja. Jedes Farming-Gebiet wird eindeutig einem Makler oder Juniormakler zugewiesen, inklusive lückenloser Kontakt- und Bewertungshistorie.",
      },
    ],
  },
];

export function findD2dIndustryBySlug(slug: string): D2dIndustryEntry | null {
  return D2D_INDUSTRIES.find((item) => item.slug === slug) ?? null;
}
