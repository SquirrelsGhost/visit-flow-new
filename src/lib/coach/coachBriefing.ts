import { coachTexts, PRACTICE_PROMPTS } from "../../texts/coachTexts";
import type { Vertical } from "../battle/battleCategories";
import { categoryLabel } from "../overview/productGroups";
import { MIN_DOORS } from "./coachProfile";
import type { CoachProfile } from "./coachTypes";

export interface CoachBriefing {
  title: string;
  lines: readonly string[];
  /** Größtes Problem plus Übungsfrage für Enes. */
  focus: { text: string; prompt: string } | null;
}

/** Tagesbriefing aus dem Coach-Profil: heute, Quoten, beste Zeit, Trend, Route, Cross-Sell, Fokus. */
export function coachBriefing(profile: CoachProfile, vertical: Vertical): CoachBriefing {
  const t = coachTexts;
  if (profile.learning) {
    return { title: t.learningTitle, lines: [t.today(profile.today.doors, profile.today.sales), t.learning(profile.doors, MIN_DOORS)], focus: null };
  }
  const lines: string[] = [t.today(profile.today.doors, profile.today.sales), t.quotes(profile.hitRate, profile.salesRate)];
  const w = profile.bestWindow;
  if (w) lines.push(t.window(w.fromHour, w.toHour, w.hitRate, w.averageRate));
  if (profile.salesTrend > 0) lines.push(t.trendUp(profile.salesTrend));
  else if (profile.salesTrend < 0) lines.push(t.trendDown(-profile.salesTrend));
  if (profile.streakDays >= 3) lines.push(t.streak(profile.streakDays));
  if (profile.streets.length > 0) lines.push(t.streets(profile.streets.map((s) => `${s.street} (${s.open})`).join(", ")));
  if (profile.topCategory && profile.rareCategory) lines.push(t.crossSell(categoryLabel(profile.topCategory), categoryLabel(profile.rareCategory)));
  const spot = profile.weakSpot;
  return { title: t.briefingTitle, lines, focus: spot ? { text: t.spot[spot], prompt: PRACTICE_PROMPTS[vertical][spot] } : null };
}

/**
 * Was Enes am Server über den Nutzer erfährt: nur Kennzahlen, keine Straßen oder Namen
 * (Feld `coach` der Chat-Anfrage, siehe Plan "Enes: Elite-D2D-Coach").
 */
export function coachContext(profile: CoachProfile) {
  return {
    doors28: profile.doors,
    hitRate: profile.hitRate,
    salesRate: profile.salesRate,
    salesTrend: profile.salesTrend,
    bestWindow: profile.bestWindow ? `${profile.bestWindow.fromHour}-${profile.bestWindow.toHour}` : null,
    weakSpot: profile.weakSpot,
    topCategory: profile.topCategory,
    rareCategory: profile.rareCategory,
    streakDays: profile.streakDays,
    today: profile.today,
    learning: profile.learning,
  };
}

export type CoachContext = ReturnType<typeof coachContext>;
