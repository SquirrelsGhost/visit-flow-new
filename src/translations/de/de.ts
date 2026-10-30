import type { ITranslation } from "../ITranslation";

const SITE = "https://visit-flow.de";
const IMAGE = `${SITE}/og/visit-flow.png`;

export const DE: ITranslation = {
  LoginPage: {
    MetaTags: {
      title: "Anmelden – Visit Flow",
      description:
        "Melde dich bei Visit Flow an und plane deine Haustür-Besuche, Laufwege und Team-Ergebnisse übersichtlich an einem Ort – auf dem Handy und am Rechner.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Anmelden", "Außendienst", "Haustürgeschäft"],
      url: `${SITE}/login`,
    },
  },

  OnboardingPage: {
    MetaTags: {
      title: "Eigenes Team starten – Visit Flow",
      description:
        "Starte mit deinem eigenen Team in Visit Flow: buche Team-Lizenzen, richte dein Konto ein und steuere Außendienst, Gebiete und Abschlüsse ab Tag eins.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Onboarding", "Team buchen", "Außendienst"],
      url: `${SITE}/onboarding`,
    },
  },

  DashboardPage: {
    MetaTags: {
      title: "Laufliste – Visit Flow",
      description:
        "Deine Laufliste in Visit Flow: interaktive Karte, Besuche und Tagesziele auf einen Blick, damit du draußen schneller arbeitest und keine Tür vergisst.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Laufliste", "Karte"],
      url: `${SITE}/dashboard`,
    },
  },

  PendingPage: {
    MetaTags: {
      title: "Visit Flow",
      description:
        "Dieser Bereich von Visit Flow wird gerade aus der bisherigen App übernommen. Bis dahin findest du deine Karte und Laufliste wie gewohnt in der App.",
      imgUrl: IMAGE,
      tags: ["Visit Flow"],
      url: SITE,
    },
  },

  BattlePage: {
    MetaTags: {
      title: "Battle Arena – Visit Flow",
      description:
        "Die Battle Arena in Visit Flow: fordere dein Team heraus, verfolge Live-Punkte, Siegesserien und den Tagesrückblick mit den Topverdienern des Teams.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Battle", "Team", "Wettbewerb"],
      url: `${SITE}/battle`,
    },
  },

  CalculatorPage: {
    MetaTags: {
      title: "Rechner – Visit Flow",
      description:
        "Der Rechner in Visit Flow: Tarife vergleichen, Ersparnis am Küchentisch zeigen und schnell mit Mehrwertsteuer rechnen, auf dem Handy und am Rechner.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Rechner", "Tarifvergleich", "Pencil Sell"],
      url: `${SITE}/statistics`,
    },
  },
  AssistantPage: {
    MetaTags: {
      title: "Assistent – Visit Flow",
      description:
        "Der Assistent in Visit Flow: Einwände, FAQ und Hotlines griffbereit, deine Provision, Ziele und Challenges im Blick und alle Vertriebsportale an einem Ort.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Assistent", "Wissensdatenbank", "Provision", "D2D"],
      url: `${SITE}/pattern-analysis-demo`,
    },
  },
  SettingsPage: {
    MetaTags: {
      title: "Einstellungen – Visit Flow",
      description:
        "Deine Einstellungen in Visit Flow: Datenschutz und deine Daten, Einwilligungen und Sicherheit an einem Ort, jederzeit änderbar und auf jedem Gerät.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Einstellungen", "Datenschutz", "Sicherheit"],
      url: `${SITE}/settings`,
    },
  },
  PrivacySettingsPage: {
    MetaTags: {
      title: "Datenschutz & meine Daten – Visit Flow",
      description:
        "Datenschutz und deine Daten in Visit Flow: gespeicherte Angaben einsehen, als Kopie herunterladen, Einwilligungen anpassen oder dein Konto löschen.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Datenschutz", "DSGVO", "Datenexport"],
      url: `${SITE}/privacy-settings`,
    },
  },
  AbrechnungPage: {
    MetaTags: {
      title: "Abrechnung – Visit Flow",
      description:
        "Abrechnung in Visit Flow: Partner-Abrechnung mit getrackten Verkäufen abgleichen, offene Provisionen, Verlauf und Aufteilung sehen und Fehlendes reklamieren.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Abrechnung", "Provision", "Reklamation"],
      url: `${SITE}/abrechnung`,
    },
  },
  ProfilePage: {
    MetaTags: {
      title: "Profil – Visit Flow",
      description:
        "Dein Profil in Visit Flow: Level und Erfolge, persönliche Daten, Nickname, Rolle und Team, Passwort sowie Abo und Rechnungen übersichtlich an einem Ort.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Profil", "Konto", "Abo"],
      url: `${SITE}/profile`,
    },
  },
  SimulatorPage: {
    MetaTags: {
      title: "Provisions-Simulator – Visit Flow",
      description:
        "Provisions-Simulator in Visit Flow: Tarife oder Leads durchrechnen, Bonus-Staffeln je Vertragsmonat sehen und das Ergebnis direkt als Monatsziel übernehmen.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Provision", "Simulator", "Bonus", "Monatsziel"],
      url: `${SITE}/provisions-simulator`,
    },
  },
  OverviewPage: {
    MetaTags: {
      title: "Übersicht – Visit Flow",
      description:
        "Deine Tagesübersicht in Visit Flow: Türen, Antreffer- und Abschlussquote, Termine und verkaufte Produkte von heute, für Führungskräfte auch Team und Struktur.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Übersicht", "Tagesstatistik", "Team"],
      url: `${SITE}/daily-view`,
    },
  },
  LicensesPage: {
    MetaTags: {
      title: "Team-Lizenzierung – Visit Flow",
      description:
        "Team-Lizenzen in Visit Flow verwalten: Belegung und Monatskosten im Blick, Lizenzen buchen, zuweisen und entziehen, Partner eintragen und Rechnungen abrufen.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Team-Lizenzen", "Lizenzverwaltung", "Abo"],
      url: `${SITE}/subscription`,
    },
  },
  DailyStatusPage: {
    MetaTags: {
      title: "Tagesstatus – Visit Flow",
      description:
        "Tagesstatus in Visit Flow: aktiv, Wakeup, krank oder Urlaub mit Zeitraum melden und als Leitung die Anwesenheit des Teams heute abhaken und teilen.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Tagesstatus", "Anwesenheit", "Team"],
      url: `${SITE}/daily-status`,
    },
  },
  TeamPerformancePage: {
    MetaTags: {
      title: "Teamleistung – Visit Flow",
      description:
        "Teamleistung in Visit Flow: Türen, Sales und Umsatz des Teams über 7, 30 oder 90 Tage, mit Trend, bestem Tag und dem Vergleich zum Zeitraum davor.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Teamleistung", "Statistik", "Team"],
      url: `${SITE}/team-performance`,
    },
  },
  CrmPage: {
    MetaTags: {
      title: "Aufträge – Visit Flow",
      description:
        "Aufträge in Visit Flow: alle Sales und Stornos des Monats samt Stornoquote im Blick, offene Aufträge abschließen, stornieren oder direkt verwerfen.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Aufträge", "Storno", "Stornoquote"],
      url: `${SITE}/crm`,
    },
  },
  CrmOverviewPage: {
    MetaTags: {
      title: "CRM-Übersicht – Visit Flow",
      description:
        "CRM-Übersicht für Admins in Visit Flow: Verkäufe aller Nutzer je Kunde mit Provision, übersichtlich gefiltert nach Zeitraum, Verkäufer und Problemen.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "CRM", "Admin", "Verkäufe"],
      url: `${SITE}/admin-crm-overview`,
    },
  },
  ExpiringPage: {
    MetaTags: {
      title: "Auslaufende Tarife – Visit Flow",
      description:
        "Auslaufende Tarife in Visit Flow: Kunden, deren Tarif in den nächsten 90 Tagen endet, nach Restlaufzeit sortiert, gefiltert und Beratern zugewiesen.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Verträge", "Ablauf", "Tarife", "Admin"],
      url: `${SITE}/expiring-contracts`,
    },
  },
  LogbookPage: {
    MetaTags: {
      title: "Fahrtenbuch – Visit Flow",
      description:
        "Fahrtenbuch in Visit Flow: Fahrten mit Kilometerstand, Ziel und Zweck erfassen, Lücken prüfen, Monate abschließen und für das Finanzamt exportieren.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Fahrtenbuch", "Kilometer", "Finanzamt", "Steuer"],
      url: `${SITE}/fahrtenbuch`,
    },
  },
  SecurityPage: {
    MetaTags: {
      title: "Security Dashboard – Visit Flow",
      description:
        "Security Dashboard in Visit Flow: Sicherheitswert, Login-Sperren, Firewall und Whitelist, Kopierschutz, Honeypot-Fallen und Audit-Protokoll für Admins.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Sicherheit", "Firewall", "Audit-Log", "Admin"],
      url: `${SITE}/security-dashboard`,
    },
  },
  BackofficePage: {
    MetaTags: {
      title: "Team-Backoffice – Visit Flow",
      description:
        "Team-Backoffice in Visit Flow: Teamleiter prüfen die Verkäufe ihres Teams, bestätigen, stornieren oder löschen sie und behalten die Stornoquote im Blick.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Backoffice", "Teamleiter", "Verkäufe", "Storno"],
      url: `${SITE}/team-backoffice`,
    },
  },

  TeamsPage: {
    MetaTags: {
      title: "Meine Teams – Visit Flow",
      description:
        "Meine Teams in Visit Flow: deine Struktur als aufklappbarer Baum mit Zahlen von heute und vom Monat, dazu Rolle, Gruppe, Mentor, Zugang und Lizenz verwalten.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Teams", "Struktur", "Verwaltung"],
      url: `${SITE}/teams`,
    },
  },

  AdminDashboardPage: {
    MetaTags: {
      title: "Admin Dashboard – Visit Flow",
      description:
        "Admin Dashboard in Visit Flow: Abschlüsse, Stornoquote, Sparten, Teams, Lizenzen und Aktivität aller Teams sowie offene Anfragen und Systemschalter.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Admin", "Dashboard", "Kennzahlen"],
      url: `${SITE}/admin-dashboard`,
    },
  },

  StreetListPage: {
    MetaTags: {
      admin: {
        title: "Admin-Straßenliste – Visit Flow",
        description:
          "Admin-Straßenliste in Visit Flow: alle Straßen mit Türen, Verkäufen und Häusern, Straßen zuweisen, Adressen korrigieren, Lösch-Anfragen und Aktivität.",
        imgUrl: IMAGE,
        tags: ["Visit Flow", "Straßenliste", "Admin", "Gebiete"],
        url: `${SITE}/admin-street-list`,
      },
      struktur: {
        title: "Team-Straßenliste – Visit Flow",
        description:
          "Team-Straßenliste in Visit Flow: die Straßen deiner Gruppe mit Türen, Verkäufen und Häusern, gefiltert nach Zeitraum und Gruppe, plus Aktivität je Person.",
        imgUrl: IMAGE,
        tags: ["Visit Flow", "Straßenliste", "Strukturleiter", "Team"],
        url: `${SITE}/strukturleiter-street-list`,
      },
      mentor: {
        title: "Mentor-Straßenliste – Visit Flow",
        description:
          "Mentor-Straßenliste in Visit Flow: wo deine Mentees unterwegs waren, mit Türen, Verkäufen und Häusern je Straße und ihrer Aktivität je Woche oder Monat.",
        imgUrl: IMAGE,
        tags: ["Visit Flow", "Straßenliste", "Mentor", "Mentees"],
        url: `${SITE}/mentor-street-list`,
      },
    },
  },
};
