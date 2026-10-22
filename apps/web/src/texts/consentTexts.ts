/** Texte des Einwilligungs-Banners. Rechtsgrundlage: § 25 TDDDG (nicht mehr TTDSG). */
export interface ConsentCategoryText {
  title: string;
  text: string;
  details: readonly string[];
}

export const consentTexts = {
  title: "Datenschutz-Einstellungen",
  text:
    "Wir speichern auf deinem Gerät nur, was für die App technisch notwendig ist (§ 25 Abs. 2 TDDDG). " +
    "Externe Inhalte laden wir erst, wenn du zustimmst. Du kannst deine Auswahl jederzeit in den Einstellungen ändern oder widerrufen.",
  reject: "Ablehnen",
  choose: "Auswählen",
  acceptAll: "Alle akzeptieren",
  save: "Auswahl speichern",
  back: "Zurück",
  close: "Schließen",
  alwaysOn: "Immer an",
  consentId: "Deine Einwilligungs-ID",
  settingsLink: "Datenschutz-Einstellungen",
  privacy: "Datenschutzerklärung",
  imprint: "Impressum",
  loadOnce: "Diesen Inhalt laden",
  allowAlways: "Externe Inhalte immer erlauben",
  externalNotice: "Hier ist ein Inhalt eines externen Anbieters eingebettet. Beim Laden wird deine IP-Adresse an diesen Anbieter übertragen.",
  necessary: {
    title: "Notwendig",
    text: "Anmeldung, Sicherheit und das Speichern dieser Auswahl.",
    details: ["Anmelde-Sitzung (Cookie vf_refresh, httpOnly)", "Diese Auswahl (lokaler Speicher vf_consent, 12 Monate)"],
  },
  external: {
    title: "Externe Inhalte",
    text: "Eingebettete Inhalte externer Anbieter, z. B. Videos.",
    details: ["Werden erst nach Zustimmung geladen", "Der Anbieter erhält dabei deine IP-Adresse"],
  },
} as const;

export type ConsentTexts = typeof consentTexts;
