import type { Vertical } from "../battle/battleCategories";
import type { NavTarget } from "./navTargets";

/** Zwei Plätze links und zwei rechts vom festen Home-Knopf. */
export const SLOT_COUNT = 4;

/** Eigene Belegung je Platz; null heißt Standard. */
export type SlotOverrides = readonly (string | null)[];

/** Standard wie v1: Battle, Übersicht | Home | Rechner (Lead: Aufträge), Assistent. */
export function defaultSlotIds(vertical: Vertical): readonly string[] {
  return ["battle", "overview", vertical === "solar" ? "crm" : "statistics", "assistant"];
}

/** Gespeicherten Wert auf genau vier Plätze bringen; Fremdes wird zu null. */
export function normalizeOverrides(value: unknown): SlotOverrides {
  const list: unknown[] = Array.isArray(value) ? value : [];
  return Array.from({ length: SLOT_COUNT }, (_, i) => (typeof list[i] === "string" ? (list[i] as string) : null));
}

export function hasOverrides(overrides: SlotOverrides): boolean {
  return overrides.some((id) => id !== null);
}

/**
 * Belegung der vier Plätze. Die Wahl des Nutzers hat Vorrang vor dem Standard; nicht erlaubte Ziele fallen weg.
 * Doppelte gibt es nie: Wäre ein Standard schon vergeben, rückt das nächste freie Ziel nach.
 */
export function resolveSlots(overrides: SlotOverrides, vertical: Vertical, available: readonly NavTarget[]): NavTarget[] {
  const byId = new Map(available.map((target) => [target.id, target]));
  const chosen = normalizeOverrides(overrides).map((id) => (id && byId.has(id) ? id : null));
  const used = new Set<string>();
  const ids: (string | null)[] = chosen.map((id) => {
    if (!id || used.has(id)) return null;
    used.add(id);
    return id;
  });
  const fallback = [...defaultSlotIds(vertical), ...available.map((target) => target.id)];
  ids.forEach((id, i) => {
    if (id) return;
    const preferred = defaultSlotIds(vertical)[i];
    const pick = preferred && byId.has(preferred) && !used.has(preferred) ? preferred : fallback.find((f) => byId.has(f) && !used.has(f));
    if (pick) {
      ids[i] = pick;
      used.add(pick);
    }
  });
  return ids.flatMap((id) => (id ? [byId.get(id) as NavTarget] : []));
}

/**
 * Legt ein Ziel auf einen Platz. Steht es schon woanders, tauschen die beiden Plätze, damit nichts doppelt ist.
 * Entspricht das Ergebnis dem Standard, wird der Platz wieder als Standard (null) gespeichert.
 */
export function assignSlot(current: readonly NavTarget[], slot: number, targetId: string, vertical: Vertical): SlotOverrides {
  const ids = current.map((target) => target.id);
  const from = ids.indexOf(targetId);
  if (from >= 0 && from !== slot) ids[from] = ids[slot] ?? targetId;
  ids[slot] = targetId;
  const defaults = defaultSlotIds(vertical);
  return normalizeOverrides(ids.map((id, i) => (id === defaults[i] ? null : id)));
}
