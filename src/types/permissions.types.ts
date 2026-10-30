/**
 * Pure Resource-Based / Capability-Based Berechtigungen (Permissions) für Visit Flow.
 * Keine starren Rollen-Abfragen: Jedes Recht folgt dem Schema `<domain>:<action>` oder `<domain>:*`.
 */
export const PERMISSIONS = [
  // Universal Superuser
  "*",

  // Admin- & Sicherheits-Domäne
  "admin:*",
  "admin:dashboard",
  "admin:security",
  "admin:streets",
  "admin:crm",
  "admin:expiring",
  "admin:users",
  "admin:permissions",

  // Team- & Führungs-Domäne
  "team:*",
  "team:view",
  "team:manage",
  "team:backoffice",
  "team:performance",
  "team:licensing",
  "team:reports",
  "team:crm",

  // Straßenlisten-Domäne
  "streets:*",
  "streets:struktur",
  "streets:mentor",
  "streets:view",

  // CRM- & Auftrags-Domäne
  "crm:*",
  "crm:team",
  "crm:own",

  // Vertriebs-Werkzeuge (Berater-Basis & Module)
  "abrechnung:*",
  "simulator:*",
  "battle:*",
  "logbook:*",
  "daily:*",
  "statistics:*",
  "partner:dashboard",
  "profile:*",
  "settings:*",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface PermissionDescriptor {
  permission: Permission;
  label: string;
  kurz: string;
  beschreibung: string;
}

/** Per Klick vergebBARE Sonder-Capabilities (unabhängig von der Stamm-Rolle). */
export const SONDER_PERMISSIONS: readonly PermissionDescriptor[] = [
  {
    permission: "admin:*",
    label: "Admin-Vollzugriff",
    kurz: "Admin · Voll",
    beschreibung: "Schaltet alle Administrations-, Sicherheits- und Übersichtsseiten frei.",
  },
  {
    permission: "admin:security",
    label: "Security-Dashboard & Firewall",
    kurz: "Security · Admin",
    beschreibung: "Zugriff auf Audit-Log, IP-Sperren, Honeypot und Sitzungswachdienst.",
  },
  {
    permission: "team:backoffice",
    label: "Team-Backoffice",
    kurz: "Backoffice",
    beschreibung: "Zugriff auf das Team-Backoffice zur Auftragsprüfung und Freigabe.",
  },
  {
    permission: "team:licensing",
    label: "Team-Lizenzen & Abos",
    kurz: "Lizenzen",
    beschreibung: "Verwaltung von Team-Plätzen, Add-ons und Abrechnung.",
  },
  {
    permission: "streets:struktur",
    label: "Strukturleiter-Straßenliste",
    kurz: "Straßen · Struktur",
    beschreibung: "Zugriff auf die gesamte Team-Straßenliste und Gebietszuteilung.",
  },
  {
    permission: "streets:mentor",
    label: "Mentor-Straßenliste",
    kurz: "Straßen · Mentor",
    beschreibung: "Zugriff auf die Mentor-Straßenliste für zugewiesene Berater.",
  },
  {
    permission: "partner:dashboard",
    label: "Partnerprogramm",
    kurz: "Partner",
    beschreibung: "Schaltet das Partner-Dashboard und Empfehlungs-Provisionen frei.",
  },
] as const;
