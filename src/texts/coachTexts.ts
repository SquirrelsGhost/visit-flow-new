import type { Vertical } from "../lib/battle/battleCategories";
import type { CoachWeakSpot } from "../lib/coach/coachTypes";

type Spot = Exclude<CoachWeakSpot, null>;

/** Texte des persönlichen Coachings von Enes (Tagesbriefing, Fokus, Profil). */
export const coachTexts = {
  briefingTitle: "Dein Briefing für heute",
  learningTitle: "Ich lerne dich gerade kennen",
  learning: (doors: number, needed: number) => `${doors} von ${needed} Türen erfasst. Danach sage ich dir, wann du am besten läufst und woran es hakt.`,
  today: (doors: number, sales: number) => (doors === 0 ? "Heute noch keine Tür. Die erste ist die wichtigste." : `Heute ${doors} Türen, ${sales} ${sales === 1 ? "Abschluss" : "Abschlüsse"}.`),
  quotes: (hit: number, sales: number) => `Letzte 4 Wochen: ${hit} % angetroffen, ${sales} % Abschluss je Gespräch.`,
  window: (from: number, to: number, rate: number, avg: number) => `Beste Zeit: ${from}–${to} Uhr mit ${rate} % Antreffern (Schnitt ${avg} %).`,
  trendUp: (n: number) => `Diese Woche ${n} Abschlüsse mehr als letzte. Weiter so!`,
  trendDown: (n: number) => `Diese Woche ${n} Abschlüsse weniger als letzte. Wir holen das zurück.`,
  streak: (n: number) => `${n} Tage in Folge draußen.`,
  streets: (list: string) => `Offene Chancen: ${list}.`,
  crossSell: (top: string, rare: string) => `Stark bei ${top}, aber ${rare} hängst du kaum an. Frag heute jedes Mal danach.`,
  focusLabel: "Fokus heute",
  practice: "Jetzt üben",
  spot: {
    notMet: "Viele Türen ohne Antwort. Lauf zu deiner besten Zeit und notier Wiedervorlagen.",
    noInterest: "Viel „kein Interesse“ direkt an der Tür. Die ersten 10 Sekunden entscheiden.",
    supplied: "Viele sind „versorgt“. Hol dir das Vertragsende und komm zur Wechselzeit wieder.",
    closing: "Gute Gespräche, aber wenig Abschlüsse. Wir üben den Abschluss.",
  } satisfies Record<Spot, string>,
} as const;

/** Was Enes beim Tipp auf "Jetzt üben" fragt: Rollenspiel zum größten Problem, je Sparte. */
export const PRACTICE_PROMPTS: Record<Vertical, Record<Spot, string>> = {
  telco: {
    notMet: "Wann treffe ich in meinem Gebiet am meisten Leute an und wie plane ich Wiedervorlagen?",
    noInterest: "Spiel einen Kunden, der an der Tür sofort „kein Interesse“ sagt. Ich übe meinen Einstieg.",
    supplied: "Spiel einen Kunden, der sagt, er ist bei seinem Anbieter versorgt. Ich übe den Wechsel.",
    closing: "Spiel einen Kunden, der interessiert ist, aber nicht unterschreibt. Ich übe den Abschluss.",
  },
  energy: {
    notMet: "Wann treffe ich am meisten Leute an und wie plane ich Wiedervorlagen für Strom und Gas?",
    noInterest: "Spiel einen Kunden, der beim Thema Strom sofort abblockt. Ich übe meinen Einstieg.",
    supplied: "Spiel einen Kunden, der bei den Stadtwerken zufrieden ist. Ich übe den Wechsel.",
    closing: "Spiel einen Kunden, der den Preis gut findet, aber erst überlegen will. Ich übe den Abschluss.",
  },
  solar: {
    notMet: "Wann treffe ich Eigentümer am besten an und wie plane ich Wiedervorlagen?",
    noInterest: "Spiel einen Eigentümer, der bei Solar sofort abwinkt. Ich übe meinen Einstieg.",
    supplied: "Spiel einen Eigentümer, der schon Angebote hat. Ich übe, den Termin trotzdem zu holen.",
    closing: "Spiel einen Eigentümer, der interessiert ist, aber keinen Termin will. Ich übe den Abschluss.",
  },
};
