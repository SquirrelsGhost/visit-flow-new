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
} as const;

export type TranslationKey = keyof typeof de;
