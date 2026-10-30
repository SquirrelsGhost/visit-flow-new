import { SECURITY_TERMS_VERSION } from "./securityPolicyTexts";

export const securityGateTexts = {
  gateTitle: "Verbindlicher Sicherheits-, Geheimhaltungs- & Wettbewerbsschutzvertrag",
  gateSubtitle: `Rechtsverbindliche Vereinbarung (${SECURITY_TERMS_VERSION}) • PYCIE Studio — Visit Flow Enterprise`,
  gateBadge: "Pflicht-Unterzeichnung vor Plattformnutzung (§ 127 BGB / § 2 GeschGehG)",
  gateStep1Label: "1. Ladungsfähige Wohn- bzw. Geschäftsanschrift (Pflichtfeld)",
  gateStep1Placeholder: "z. B. Musterstraße 12, 70173 Stuttgart",
  gateStep1Hint: "Wird direkt in § 10 Ihres persönlichen PDF-Vertragsdokuments eingetragen.",
  gateStep2Label: "2. Sicherheitsrichtlinien & AGB als PDF herunterladen & prüfen",
  gateStep2Button: "Vertrag als PDF herunterladen (Pflichtschritt)",
  gateStep2Done: "PDF-Vertrag erfolgreich heruntergeladen & geöffnet",
  gateStep3Label: "3. Eigenhändige digitale Unterschrift (§ 126a / § 127 BGB)",
  gateCheckboxStandard:
    "Ich habe die Sicherheitsrichtlinien, AGB, Geheimhaltungs-, Kundenschutz- und Anti-KI-Nachbaubestimmungen (§§ 1–9, inkl. Vertragsstrafe nach Hamburger Brauch § 7.1) vollständig gelesen, als PDF gespeichert und akzeptiere diese rechtsverbindlich.",
  gateCheckboxLeader:
    "Ich habe die Sicherheitsrichtlinien, AGB, Geheimhaltungs-, Kundenschutz- und Anti-KI-Nachbaubestimmungen (§§ 1–9) gelesen und akzeptiere diese rechtsverbindlich. Als Führungskraft (Teamleiter/Strukturleiter/Mentor) übernehme ich ausdrücklich die persönliche Aufsichts- und Einstandspflicht (§ 3 & § 278 BGB) dafür, dass kein Mitglied meines Teams Visit Flow kopiert, abfotografiert oder mittels KI-Tools nachbaut.",
  gateLeaderWarningTitle: "Besondere Hinweis- & Bürgschaftspflicht für Führungskräfte (§ 3 & § 278 BGB)",
  gateLeaderWarningBody:
    "Als Teamleiter, Strukturleiter oder Mentor haften Sie für die sorgfältige Auswahl und Überwachung Ihrer Teammitglieder. Vergeben Sie Lizenzen niemals an Externe oder unüberprüfte Personen.",
  gateSubmitButton: "Vertrag rechtsverbindlich unterzeichnen & freischalten",
  gateSavedToast: "Sicherheits- & Geheimhaltungsvertrag rechtsverbindlich unterzeichnet.",

  identTitle: "Online-Ident-Verfahren (KYC) & Team-Haftungsbürgschaft",
  identSubtitle: "Pflicht-Verifizierung für Teamleiter, Strukturleiter & Mentoren (§ 3.1 & § 278 BGB)",
  identBadgeVerified: "Online-Ident verifiziert",
  identBadgePending: "Verifizierung ausstehend",
  identIntro:
    "Vor der Freischaltung von Team-Lizenzen ist die amtliche Identitätsfeststellung der verantwortlichen Führungskraft erforderlich. Die Daten werden kryptografisch mit Ihrem Lizenzkonto und § 10 des Sicherheitsvertrages verknüpft.",
  identFullNameLabel: "Vollständiger Name (exakt laut Ausweisdokument)",
  identBirthDateLabel: "Geburtsdatum",
  identDocTypeLabel: "Art des amtlichen Ausweisdokuments",
  identDocTypeIdCard: "Deutscher / EU-Personalausweis",
  identDocTypePassport: "Reisepass",
  identDocTypeResidence: "Elektronischer Aufenthaltstitel (eAT)",
  identDocNumberLabel: "Ausweis- / Seriennummer",
  identDocNumberPlaceholder: "z. B. L01X00T47",
  identAuthorityLabel: "Ausstellende Behörde",
  identAuthorityPlaceholder: "z. B. Stadt Stuttgart / Bürgerbüro",
  identAddressLabel: "Meldeanschrift laut Ausweis",
  identAddressPlaceholder: "Straße, Hausnr., PLZ, Ort",
  identScanFrontLabel: "Ausweis-Vorderseite geprüft & Lichtbild abgeglichen",
  identScanBackLabel: "Ausweis-Rückseite & Live-Selfie-Abgleich durchgeführt",
  identLiabilityCheck:
    "Verbindliche Führungskräfte-Bürgschaft (§ 278 BGB): Ich bestätige die Richtigkeit meiner amtlichen Ausweisdaten. Ich stehe persönlich dafür ein, dass in meinem Team keine Zugänge an Dritte weitergegeben werden und kein Teammitglied Oberflächen, Berechnungen oder Workflows von Visit Flow kopiert oder mit KI-Werkzeugen (Claude Code, Cursor, ChatGPT etc.) nachbaut.",
  identSubmitButton: "Online-Ident & Team-Bürgschaft verbindlich abschließen",
  identSavedToast: "Online-Ident-Verifizierung & Team-Bürgschaft erfolgreich gespeichert.",

  assignIdentGateTitle: "Online-Ident-Verifizierung erforderlich (§ 3.1 Sicherheitsvertrag)",
  assignIdentGateText:
    "Um Team-Lizenzen zuzuweisen, müssen Teamleiter einmalig das Online-Ident-Verfahren (KYC) inkl. Team-Haftungsbürgschaft (§ 278 BGB) abschließen.",
  assignIdentGateButton: "Online-Ident jetzt durchführen",

  settingsContractTitle: "Sicherheits- & Wettbewerbsschutzvertrag (PDF)",
  settingsContractText: `Geheimhaltung, Anti-KI-Nachbau & Kundenschutz (${SECURITY_TERMS_VERSION})`,
  settingsIdentTitle: "Online-Ident (Führungskräfte-KYC)",
  settingsIdentText: "Amtliche Ausweis-Verifizierung & Team-Haftungsbürgschaft (§ 278 BGB)",

  shieldBadge: "VF-Shield aktiv",
  shieldTooltip: "Aktiver Kopier-, Wasserzeichen- & Anti-KI-Cloning-Schutz (§ 2 GeschGehG)",
  lockOverlayTitle: "Sicherheitsverstoß erkannt — Sitzung gesperrt",
  lockOverlayBody:
    "Das Sicherheitssystem (VF-Shield) hat einen unzulässigen Analyse-, Kopier- oder Manipulationsversuch registriert. Der Vorgang wurde mit Zeitstempel, IP und Geräte-Fingerprint protokolliert (§ 5 Sicherheitsvertrag).",
  lockOverlayButton: "Ansicht neu laden",
} as const;
