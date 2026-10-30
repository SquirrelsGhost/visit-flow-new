import { describe, expect, it } from "vitest";
import { duelState, featuredDuel, shareOfBest } from "../lib/battle/duel";
import type { Challenge } from "../lib/battle/battleTypes";

const battle = (id: string, a: string, b: string): Challenge => ({
  id, challengerId: a, challengerName: a, opponentId: b, opponentName: b, status: "active",
  challengerScore: 0, opponentScore: 0, date: "2026-10-23", createdAt: "", expiresAt: "",
});

describe("duelState", () => {
  it("steht bei 0:0 in der Mitte ohne Führenden", () => {
    expect(duelState(0, 0)).toEqual({ share: 0.5, leader: null, gap: 0 });
  });
  it("zeigt Führung und Vorsprung", () => {
    expect(duelState(3, 1)).toMatchObject({ share: 0.75, leader: "left", gap: 2 });
    expect(duelState(1, 4)).toMatchObject({ leader: "right", gap: 3 });
  });
  it("lässt beiden Seiten einen sichtbaren Rest", () => {
    expect(duelState(5, 0).share).toBe(0.92);
    expect(duelState(0, 5).share).toBe(0.08);
  });
});

describe("featuredDuel", () => {
  const scores: Record<string, number> = { a: 1, b: 1, c: 5, d: 4, me: 0, x: 0 };
  const scoreOf = (id: string) => scores[id] ?? 0;
  it("nimmt das eigene Duell zuerst", () => {
    const f = featuredDuel([battle("1", "c", "d"), battle("2", "me", "x")], "me", scoreOf);
    expect(f).toMatchObject({ mine: true, battle: { id: "2" } });
  });
  it("nimmt sonst das punktreichste", () => {
    const f = featuredDuel([battle("1", "a", "b"), battle("2", "c", "d")], "me", scoreOf);
    expect(f).toMatchObject({ mine: false, battle: { id: "2" } });
  });
  it("ist ohne Battles leer", () => {
    expect(featuredDuel([], "me", scoreOf)).toBeNull();
  });
});

describe("shareOfBest", () => {
  it("rechnet relativ zum Besten", () => {
    expect(shareOfBest(50, 200)).toBe(0.25);
    expect(shareOfBest(5, 0)).toBe(0);
  });
});
