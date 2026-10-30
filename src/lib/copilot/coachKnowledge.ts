import { coachMemoryTexts as t } from "../../texts/coachMemoryTexts";
import { MIN_DOORS } from "../coach/coachProfile";
import type { CoachProfile } from "../coach/coachTypes";
import { categoryLabel } from "../overview/productGroups";
import { COACH_MEMORY_KINDS, type CoachMemory, type CoachMemoryKind } from "./coachMemoryApi";

export interface CoachFact {
  key: string;
  label: string;
  value: string;
}

export interface CoachMemoryGroup {
  kind: CoachMemoryKind;
  items: CoachMemory[];
}

/** Erinnerungen nach Art, in fester Reihenfolge; leere Arten fallen weg. */
export function groupMemories(items: readonly CoachMemory[]): CoachMemoryGroup[] {
  return COACH_MEMORY_KINDS.map((kind) => ({ kind, items: items.filter((m) => m.kind === kind) })).filter((g) => g.items.length > 0);
}

/**
 * Was Enes aus den eigenen Türen weiß: genau die Kennzahlen, die die App ihm schickt
 * (siehe coachContext). Straßen bleiben auf dem Gerät und tauchen hier nicht auf.
 */
export function coachFacts(profile: CoachProfile): CoachFact[] {
  if (profile.learning) return [{ key: "learning", label: t.facts.learning, value: t.facts.learningValue(profile.doors, MIN_DOORS) }];
  const facts: CoachFact[] = [
    { key: "doors", label: t.facts.doors, value: String(profile.doors) },
    { key: "hit", label: t.facts.hitRate, value: `${profile.hitRate} %` },
    { key: "sales", label: t.facts.salesRate, value: `${profile.salesRate} %` },
  ];
  const w = profile.bestWindow;
  if (w) facts.push({ key: "window", label: t.facts.bestWindow, value: `${w.fromHour}–${w.toHour} Uhr` });
  if (profile.weakSpot) facts.push({ key: "spot", label: t.facts.weakSpot, value: t.spot[profile.weakSpot] });
  if (profile.topCategory) facts.push({ key: "top", label: t.facts.topCategory, value: categoryLabel(profile.topCategory) });
  if (profile.streakDays > 0) facts.push({ key: "streak", label: t.facts.streak, value: t.facts.days(profile.streakDays) });
  return facts;
}
