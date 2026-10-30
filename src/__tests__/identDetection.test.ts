import { describe, expect, it } from "vitest";
import { cardHint, cardStats, frameMotion } from "@/lib/ident/cardMetrics";
import { faceHint, type FaceFrame } from "@/lib/ident/faceMetrics";
import { initialLiveness, stepLiveness, type LivenessState } from "@/lib/ident/livenessMachine";

const face = (patch: Partial<FaceFrame> = {}): FaceFrame => ({ yaw: 0, pitch: 0.55, cx: 0.5, cy: 0.5, height: 0.5, blink: 0, jaw: 0, ...patch });

function run(state: LivenessState, frames: { t: number; f: FaceFrame; audio?: number | null }[]) {
  const events: string[] = [];
  let s = state;
  for (const { t, f, audio = null } of frames) {
    const r = stepLiveness(s, { ts: t, face: f, hint: faceHint([f], 120), audio });
    s = r.state;
    if (r.event) events.push(r.event);
  }
  return { s, events };
}

const hold = (from: number, ms: number, f: FaceFrame, audio: number | null = null) => Array.from({ length: Math.ceil(ms / 50) + 1 }, (_, i) => ({ t: from + i * 50, f, audio }));

describe("Live-Ident Erkennung", () => {
  it("meldet Abstand, Mitte, Licht und mehrere Personen", () => {
    expect(faceHint([], 120)).toBe("noFace");
    expect(faceHint([face(), face()], 120)).toBe("multiple");
    expect(faceHint([face()], 30)).toBe("dark");
    expect(faceHint([face({ height: 0.2 })], 120)).toBe("tooFar");
    expect(faceHint([face({ cx: 0.8 })], 120)).toBe("offCenter");
    expect(faceHint([face()], 120)).toBeNull();
  });

  it("läuft Ausrichten, links, rechts, oben und Sprechen automatisch durch und zählt Blinzeln", () => {
    let { s, events } = run(initialLiveness(), hold(0, 1000, face()));
    expect(events).toEqual(["aligned"]);
    expect(s.phase).toBe("move");

    ({ s, events } = run(s, [...hold(1100, 200, face({ yaw: 0.05 })), ...hold(1400, 400, face({ yaw: 0.16 }))]));
    expect(events).toEqual(["moveDone"]);
    ({ s, events } = run(s, hold(2000, 400, face({ yaw: -0.16 }))));
    expect(events).toEqual(["moveDone"]);
    ({ s } = run(s, [{ t: 2500, f: face({ blink: 0.8 }) }, { t: 2550, f: face({ blink: 0.1 }) }]));
    expect(s.blinks).toBe(1);
    ({ s, events } = run(s, hold(2600, 400, face({ pitch: 0.48 }))));
    expect(events).toEqual(["moveDone"]);

    const talking = Array.from({ length: 80 }, (_, i) => ({ t: 3100 + i * 50, f: face({ jaw: i % 2 ? 0.25 : 0.05 }), audio: 0.1 }));
    ({ s, events } = run(s, talking));
    expect(events).toEqual(["done"]);
    expect(s.evidence.map((e) => e.move)).toEqual(["left", "right", "up", "speak"]);
  });

  it("zählt Sprechen ohne Ton nicht, wenn das Mikrofon still ist", () => {
    const base: LivenessState = { ...initialLiveness(), phase: "move", moveIdx: 3, neutral: { yaw: 0, pitch: 0.55 } };
    const silent = Array.from({ length: 80 }, (_, i) => ({ t: i * 50, f: face({ jaw: i % 2 ? 0.25 : 0.05 }), audio: 0 }));
    expect(run(base, silent).s.phase).toBe("move");
  });

  it("erkennt beim Ausweis Lichtbild-Lage, Rückseite, Spiegelung und Bewegung", () => {
    const sharp = { mean: 140, contrast: 50, glare: 0, sharpness: 400 };
    const portrait = { cx: 0.25, cy: 0.5, height: 0.5 };
    expect(cardHint({ side: "front", stats: sharp, motion: 2, portrait, strictness: 1 })).toBeNull();
    expect(cardHint({ side: "front", stats: sharp, motion: 2, portrait: null, strictness: 1 })).toBe("noPortrait");
    expect(cardHint({ side: "front", stats: sharp, motion: 2, portrait: { ...portrait, cx: 0.75 }, strictness: 1 })).toBe("flip");
    expect(cardHint({ side: "back", stats: sharp, motion: 2, portrait, strictness: 1 })).toBe("showBack");
    expect(cardHint({ side: "back", stats: { ...sharp, glare: 0.1 }, motion: 2, portrait: null, strictness: 1 })).toBe("glare");
    expect(cardHint({ side: "back", stats: sharp, motion: 20, portrait: null, strictness: 1 })).toBe("holdStill");
  });

  it("misst Schärfe und Bewegung auf Graustufen", () => {
    const w = 20, h = 20;
    const flat = new Uint8Array(w * h).fill(128);
    const checker = new Uint8Array(w * h).map((_, i) => ((i % w) + Math.floor(i / w)) % 2 ? 255 : 0);
    expect(cardStats(checker, w, h).sharpness).toBeGreaterThan(cardStats(flat, w, h).sharpness);
    expect(frameMotion(flat, flat)).toBe(0);
    expect(frameMotion(null, flat)).toBe(255);
  });
});
