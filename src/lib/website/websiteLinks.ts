/**
 * Schalter und Ziele der Website.
 * Solange das große Update nicht veröffentlicht ist, bleibt WEBSITE_LAUNCHED aus:
 * Knöpfe zeigen "Demnächst" statt "Team starten".
 */
export const WEBSITE_LAUNCHED = false;

export const WEBSITE_LINKS = {
  login: "/login",
  app: "/dashboard",
  onboarding: "/onboarding",
  features: "#funktionen",
  // Rechtstexte liegen noch auf der v1-Seite, bis sie in v2 portiert sind
  imprint: "https://visit-flow.de/impressum",
  privacy: "https://visit-flow.de/privacy-policy",
} as const;

/** Ab dieser Scrollhöhe bekommt die Navigation ihre Glasfläche. */
export const NAV_SOLID_AFTER = 24;
