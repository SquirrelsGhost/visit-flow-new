/**
 * Deutsche Übersetzungen, Schlüssel und Texte 1:1 aus v1 (context/i18n/locales/de.json).
 * Es kommen nur die Schlüssel dazu, die ein bereits portiertes Modul braucht.
 */
export const de = {
  "app.title": "Visit Flow",
  "app.welcomeBack": "Willkommen zurück",
  "auth.login": "Anmelden",
  "auth.loggingIn": "Anmeldung...",
  "auth.loading": "Lädt...",
  "auth.emailOrName": "E-Mail oder Name",
  "auth.emailOrNamePlaceholder": "name@beispiel.de oder Name",
  "auth.password": "Passwort",
  "auth.passwordPlaceholder": "••••••••",
  "auth.rememberMe": "Angemeldet bleiben",
  "auth.forgotPassword": "Passwort vergessen?",
  "nav.home": "Laufliste",
  "nav.battle": "Battle",
  "nav.overview": "Übersicht",
  "nav.statistics": "Rechner",
  "nav.crm": "Aufträge",
  "nav.assistant": "Assistent",
  "nav.profile": "Profil",
  "nav.settings": "Einstellungen",
  "nav.logout": "Abmelden",
  "nav.themeDark": "Dunkler Modus",
  "nav.themeLight": "Heller Modus",
  "nav.offline": "Offline",
  "header.userAccount": "Benutzerkonto",
} as const;

export type TranslationKey = keyof typeof de;
