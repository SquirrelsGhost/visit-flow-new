import { describe, expect, it } from "vitest";
import { evaluate, formatResult, nextParen, sanitize } from "../lib/calculator/calcEngine";

describe("calcEngine", () => {
  it("rechnet Punkt vor Strich und Klammern", () => {
    expect(evaluate("2+3*4")).toBe(14);
    expect(evaluate("(2+3)*4")).toBe(20);
    expect(evaluate("-3+5")).toBe(2);
    expect(evaluate("10/4")).toBe(2.5);
  });

  it("leer ist 0, unvollständig oder durch 0 ist ungültig", () => {
    expect(evaluate("")).toBe(0);
    expect(evaluate("5+")).toBeNull();
    expect(evaluate("(5")).toBeNull();
    expect(evaluate("1/0")).toBeNull();
  });

  it("versteht Prozent wie ein Taschenrechner", () => {
    expect(evaluate("100+19%")).toBeCloseTo(119);
    expect(evaluate("200-10%")).toBeCloseTo(180);
    expect(evaluate("50*10%")).toBeCloseTo(5);
    expect(evaluate("19.99*3 + 7%")).toBeCloseTo(64.1679);
  });

  it("filtert fremde Zeichen und formatiert deutsch", () => {
    expect(sanitize("2a+b3")).toBe("2+3");
    expect(evaluate("alert(1)")).toBe(1);
    expect(formatResult(1234.5)).toBe("1.234,5");
    expect(formatResult(null)).toBe("—");
  });

  it("wählt die passende Klammer", () => {
    expect(nextParen("")).toBe("(");
    expect(nextParen("(2+3")).toBe(")");
    expect(nextParen("(2+")).toBe("(");
    expect(nextParen("(2+3)")).toBe("(");
  });
});
