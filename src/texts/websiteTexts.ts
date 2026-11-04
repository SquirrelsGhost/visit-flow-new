/**
 * Texte der öffentlichen Website (Startseite "/").
 * Das große Update ist noch nicht veröffentlicht: alles als "kommt bald" formuliert.
 * Umschalten nach dem Start über WEBSITE_LAUNCHED in lib/website/websiteLinks.ts. Texte der Reise: websiteJourneyTexts.ts.
 */
export const websiteTexts = {
  brand: "Visit Flow",
  nav: {
    label: "Hauptnavigation",
    home: "Visit Flow Startseite",
    links: [
      { href: "#funktionen", label: "Die Reise" },
      { href: "#stimme", label: "Praxis" },
      { href: "#preise", label: "Preise" },
    ],
    login: "Anmelden",
    openApp: "Zur App",
    soundOn: "Klang an",
    soundOff: "Klang aus",
    soundHint: "Klänge der Website ein- oder ausschalten",
  },
} as const;
