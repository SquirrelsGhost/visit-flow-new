import { describe, expect, it } from "vitest";
import { assignSlot, normalizeOverrides, resolveSlots } from "../lib/navigation/navSlots";
import { availableNavTargets } from "../lib/navigation/navTargets";

const berater = { id: "u1", email: "b@test.de", role: "berater" };
const teamleiter = { id: "u2", email: "t@test.de", role: "teamleiter" };
const ids = (list: readonly { id: string }[]) => list.map((t) => t.id);

describe("Belegung der unteren Leiste", () => {
  it("nimmt ohne eigene Wahl den Standard aus v1, im Lead-Bereich Aufträge statt Rechner", () => {
    const options = availableNavTargets(berater, "telco");
    expect(ids(resolveSlots([], "telco", options))).toEqual(["battle", "overview", "statistics", "assistant"]);
    expect(ids(resolveSlots([], "solar", availableNavTargets(berater, "solar")))).toEqual(["battle", "overview", "crm", "assistant"]);
  });

  it("gibt der Wahl des Nutzers Vorrang, auch im Lead-Bereich", () => {
    const options = availableNavTargets(berater, "solar");
    expect(ids(resolveSlots([null, null, "statistics", null], "solar", options))).toEqual(["battle", "overview", "statistics", "assistant"]);
  });

  it("tauscht, wenn die gewählte Seite schon auf einem anderen Platz steht", () => {
    const options = availableNavTargets(berater, "telco");
    const current = resolveSlots([], "telco", options);
    const next = assignSlot(current, 0, "assistant", "telco");
    expect(ids(resolveSlots(next, "telco", options))).toEqual(["assistant", "overview", "statistics", "battle"]);
  });

  it("speichert Standard wieder als null und ersetzt Rechner durch Aufträge", () => {
    const options = availableNavTargets(berater, "telco");
    const next = assignSlot(resolveSlots([], "telco", options), 2, "crm", "telco");
    expect(next).toEqual([null, null, "crm", null]);
    expect(assignSlot(resolveSlots(next, "telco", options), 2, "statistics", "telco")).toEqual([null, null, null, null]);
  });

  it("lässt nie doppelte Ziele zu und füllt mit dem nächsten freien auf", () => {
    const options = availableNavTargets(berater, "solar");
    const slots = resolveSlots(["crm", "crm", null, null], "solar", options);
    expect(new Set(ids(slots)).size).toBe(4);
    expect(ids(slots)).toEqual(["crm", "overview", "battle", "assistant"]);
  });

  it("filtert nach Rolle: Meine Teams und Lizenzen nur für Führung, sonst fällt die Wahl auf den Standard zurück", () => {
    expect(ids(availableNavTargets(berater, "telco"))).not.toContain("my-teams");
    expect(ids(availableNavTargets(teamleiter, "telco"))).toEqual(expect.arrayContaining(["my-teams", "licensing"]));
    const slots = resolveSlots(["licensing", null, null, null], "telco", availableNavTargets(berater, "telco"));
    expect(ids(slots)[0]).toBe("battle");
  });

  it("verträgt kaputte gespeicherte Werte", () => {
    expect(normalizeOverrides("x")).toEqual([null, null, null, null]);
    expect(normalizeOverrides([1, "crm"])).toEqual([null, "crm", null, null]);
  });
});
