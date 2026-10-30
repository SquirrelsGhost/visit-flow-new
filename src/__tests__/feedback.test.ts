import { describe, expect, it } from "vitest";
import type { Challenge } from "../lib/battle/battleTypes";
import { DEFAULT_FEEDBACK_PREFS, getFeedbackPrefs, setFeedbackPrefs } from "../lib/feedback/feedbackPrefs";
import { battleWinMarker } from "../lib/feedback/feedbackMoments";

const battle = (id: string, winnerId?: string) => ({ id, date: "2026-10-22", winnerId }) as Challenge;

describe("Feedback", () => {
  it("startet mit leisen Sounds und Haptik an", () => {
    expect(getFeedbackPrefs()).toEqual(DEFAULT_FEEDBACK_PREFS);
    expect(DEFAULT_FEEDBACK_PREFS).toEqual({ sound: true, haptics: true, volume: "low" });
  });

  it("merkt sich Änderungen", () => {
    setFeedbackPrefs({ sound: false, volume: "high" });
    expect(getFeedbackPrefs()).toEqual({ sound: false, haptics: true, volume: "high" });
    setFeedbackPrefs(DEFAULT_FEEDBACK_PREFS);
  });

  it("feiert nur eigene Battle-Siege", () => {
    expect(battleWinMarker([battle("a", "u2"), battle("b")], "u1")).toBeNull();
    expect(battleWinMarker([battle("a", "u2"), battle("b", "u1")], "u1")).toBe("2026-10-22:b");
    expect(battleWinMarker([battle("a", "u1")], "")).toBeNull();
  });
});
