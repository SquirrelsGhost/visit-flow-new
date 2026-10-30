import type { FeedbackSound } from "../lib/feedback/feedbackSounds";
import type { FeedbackVolume } from "../lib/feedback/feedbackPrefs";

/** Texte für Sounds & Haptik (Einstellungen → App). */
export const feedbackTexts = {
  group: "Sounds & Haptik",
  footer:
    "Die Klänge entstehen direkt in der App und sind bewusst leise. Auf dem iPhone folgen sie dem Stumm-Schalter; Vibration gibt es dort nur in der nativen App, im Browser übernimmt der Klang.",
  sound: "Sounds",
  soundText: "Leise Klänge bei Tippen, Erfolg und Fehlern",
  volume: "Lautstärke",
  haptics: "Haptik",
  hapticsText: "Kurzes Vibrieren bei Aktionen (Android und native App)",
  preview: "Vorhören",
  previewText: "Alle Klänge der App einmal anhören",
  previewSubtitle: "Tippe auf einen Moment. Große Momente zeigen auch ihr Konfetti.",
  previewMuted: "Sounds sind aus. Du spürst nur die Haptik.",
  volumes: { low: "Leise", medium: "Mittel", high: "Laut" } satisfies Record<FeedbackVolume, string>,
} as const;

/** Die Momente in der Vorhör-Liste: Klang, Name und wo er in der App vorkommt. */
export const FEEDBACK_MOMENTS: readonly { sound: FeedbackSound; title: string; where: string }[] = [
  { sound: "sale", title: "Verkauf gespeichert", where: "Karte: Abschluss mit Produkten speichern" },
  { sound: "win", title: "Battle gewonnen", where: "Battle: einmal nach deinem Sieg" },
  { sound: "levelUp", title: "Level-Aufstieg", where: "Profil: wenn dein Level gestiegen ist" },
  { sound: "challenge", title: "Herausforderung", where: "Battle: herausfordern, annehmen, neue Herausforderung" },
  { sound: "milestone", title: "Meilenstein", where: "Rechner: Ergebnis knackt die Feier-Schwelle" },
  { sound: "success", title: "Erfolg", where: "Jede Erfolgsmeldung: gespeichert, kopiert, Lizenz hinzugefügt" },
  { sound: "storno", title: "Storno", where: "Aufträge: stornieren oder verwerfen" },
  { sound: "warning", title: "Hinweis", where: "Warnmeldungen, z. B. offline gespeichert" },
  { sound: "error", title: "Fehler", where: "Jede Fehlermeldung" },
  { sound: "sheetOpen", title: "Sheet öffnen", where: "Sheets und Dialoge gleiten herein" },
  { sound: "sheetClose", title: "Sheet schließen", where: "Sheets und Dialoge gleiten hinaus" },
  { sound: "toggleOn", title: "Schalter an", where: "Schalter in den Einstellungen" },
  { sound: "toggleOff", title: "Schalter aus", where: "Schalter in den Einstellungen" },
  { sound: "select", title: "Reiter wechseln", where: "Untere Leiste und Reiter-Leisten" },
];
