/** Feste Texte der Login-Seite, wortgleich aus v1 (dort direkt im JSX). */
export const loginTexts = {
  tabOnboarding: "Eigenes Team buchen",
  tabRegister: "Berater-Beitritt",
  errorTitle: {
    ipBlocked: "IP-Adresse gesperrt",
    rateLimit: "Rate Limit erreicht",
    network: "Verbindungsfehler",
    generic: "Fehler",
  },
  emailOrNameRequired: "E-Mail oder Name ist erforderlich",
  passwordRequired: "Passwort ist erforderlich",
  loginFailed: "Login fehlgeschlagen",
  welcome: (name: string) => `Willkommen, ${name}`,
  tabPending: "Dieser Bereich wird gerade aus der bisherigen App übernommen und folgt im nächsten Schritt.",
} as const;

/** Texte des Kompasses im Login-Kopf (Doppelklick zeigt die Qibla-Richtung). */
export const compassTexts = {
  hint: "Doppelklick für Qibla-Richtung",
  orientationRequired: "🧭 Kompass-Berechtigung erforderlich",
  gpsRequired: "📍 GPS-Berechtigung erforderlich für Qibla-Richtung",
  gpsUnsupported: "📍 GPS nicht unterstützt",
  gpsFailed: "❌ Fehler beim Abrufen der GPS-Position",
  normalMode: "🧭 Normaler Kompass-Modus",
  qibla: (bearing: number, direction: string, accuracy: number | null) =>
    `🕋 Qibla: ${Math.round(bearing)}° ${direction}${accuracy ? ` (GPS: ±${Math.round(accuracy)}m)` : ""}`,
} as const;

/** Texte der Fehlerseite, wenn die Anmeldung abstürzt (v1 AuthErrorBoundary). */
export const authErrorTexts = {
  title: "Authentifizierungsfehler",
  subtitle: "Es ist ein unerwarteter Fehler aufgetreten",
  body: "Die Anwendung konnte nicht ordnungsgemäß geladen werden. Bitte versuchen Sie eine der folgenden Optionen:",
  retry: "Erneut versuchen",
  reload: "Seite neu laden",
  toLogin: "Zur Anmeldung",
  support: "Falls das Problem weiterhin besteht, wenden Sie sich an den Support.",
  errorId: (id: string) => `Fehler-ID: ${id}`,
} as const;

/** Vorläufige Startseite nach dem Login, bis das Dashboard portiert ist. */
export const homeTexts = {
  signedInAs: (name: string) => `Angemeldet als ${name}`,
  pending: "Das Dashboard wird als Nächstes aus der bisherigen App übernommen.",
  logout: "Abmelden",
} as const;
