import { describe, expect, it } from "vitest";
import { copilotChatInputSchema, type CoachContext } from "@visit-flow/shared/copilotSchema";
import { createMarkerFilter } from "../modules/copilot/copilotMarkers";
import { explicitMemory } from "../modules/copilot/copilotMemoryRules";
import { buildCopilotMessages } from "../modules/copilot/copilotPrompt";
import { createSanitizer, redactPii } from "../modules/copilot/copilotSanitizer";
import { readSseChunks } from "../modules/copilot/llm/LlmClient";

function streamAll(chunks: string[]) {
  const filter = createMarkerFilter();
  const out = chunks.map((c) => filter.push(c)).join("") + filter.end();
  return { out, markers: filter.markers };
}

const coach: CoachContext = {
  doors28: 240, hitRate: 41, salesRate: 16, salesTrend: 2, bestWindow: "17-19", weakSpot: "noInterest",
  topCategory: "Internet", rareCategory: "Mobilfunk", streakDays: 4, today: { doors: 12, sales: 1 }, learning: false,
};

describe("Marker-Filter", () => {
  it("entfernt NAV- und MERKEN-Marker, auch wenn sie über mehrere Stücke verteilt kommen", () => {
    const { out, markers } = streamAll(["Öffne dir ", "den Rechner. [[NA", "V:/statistics]] [[MERKEN:pref", "erence|Arbeitet lieber abends]]"]);
    expect(out).toBe("Öffne dir den Rechner.");
    expect(markers.nav).toBe("/statistics");
    expect(markers.remember).toEqual([{ kind: "preference", content: "Arbeitet lieber abends" }]);
  });

  it("gibt nur ganze Wörter weiter und lässt fremde Adressen und unbekannte Arten weg", () => {
    const filter = createMarkerFilter();
    expect(filter.push("Hallo Ag")).toBe("Hallo");
    expect(filter.push("ent, los [[NAV:https://evil.example]] [[MERKEN:kunde|Herr Meier]]")).toBe(" Agent, los");
    expect(filter.end()).toBe("");
    expect(filter.markers).toEqual({ nav: null, remember: [] });
  });

  it("verwirft einen nie geschlossenen Marker", () => {
    expect(streamAll(["Klar. [[NAV:/crm"]).out).toBe("Klar.");
  });
});

describe("Sanitizer", () => {
  it("schwärzt E-Mail, Telefon, IBAN und Adresse", () => {
    const text = redactPii("Mail max@test.de, Tel 0171 1234567, IBAN DE89 3704 0044 0532 0130 00, Hauptstraße 5");
    expect(text).toBe("Mail [EMAIL], Tel [TEL], IBAN [IBAN], [ADRESSE]");
  });

  it("maskiert den Vornamen und setzt ihn in der Antwort zurück", () => {
    const s = createSanitizer("Emre");
    expect(s.outbound("Ich bin emre")).toBe("Ich bin Agent");
    expect(s.inbound("Stark, Agent!")).toBe("Stark, Emre!");
    expect(createSanitizer().inbound("Stark, Agent!")).toBe("Stark, Agent!");
  });
});

describe("Merk-Wünsche", () => {
  it("erkennt ausdrückliche Wünsche", () => {
    expect(explicitMemory("Merk dir, dass ich nur nachmittags laufe.")).toBe("ich nur nachmittags laufe");
    expect(explicitMemory("Enes, vergiss nicht: mein Ziel sind 30 Abschlüsse")).toBe("mein Ziel sind 30 Abschlüsse");
    expect(explicitMemory("Wie merke ich mir Einwände?")).toBeNull();
    expect(explicitMemory("merk dir")).toBeNull();
  });
});

describe("Prompt", () => {
  const input = copilotChatInputSchema.parse({
    message: "Emre hier, Kunde max@test.de sagt kein Interesse",
    history: [{ sender: "user", text: "Hallo" }, { sender: "ai", text: "Hi Emre!" }],
    currentPath: "/dashboard",
    vertical: "energy",
    coach,
  });
  const messages = buildCopilotMessages({
    input,
    role: "berater",
    memories: [{ id: "1", kind: "preference", content: "Emre arbeitet lieber abends", createdAt: "" }],
    liked: [{ question: "Einwand Preis?", reply: "Sag: \"Rechnen wir kurz nach.\"" }],
    now: new Date("2026-10-24T15:00:00Z"),
    sanitizer: createSanitizer("Emre"),
  });
  const system = messages[0]?.content ?? "";

  it("baut Persona, Sparte, Profil, Gedächtnis und Beispiele ein", () => {
    expect(system).toContain("Door-to-Door-Sales-Coach");
    expect(system).toContain("SPARTE ENERGIE");
    expect(system).toContain("41 % angetroffen");
    expect(system).toContain("ersten 10 Sekunden");
    expect(system).toContain("Agent arbeitet lieber abends");
    expect(system).toContain("Rechnen wir kurz nach.");
    expect(system).toContain("Samstag");
  });

  it("schickt weder Namen noch Kontaktdaten an das Modell", () => {
    const all = JSON.stringify(messages);
    expect(all).not.toContain("Emre");
    expect(all).not.toContain("max@test.de");
    expect(messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"]);
  });
});

const sseBody = (parts: string[]) => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const p of parts) controller.enqueue(encoder.encode(p));
      controller.close();
    },
  });
};

async function collect(parts: string[]) {
  const out = [];
  for await (const chunk of readSseChunks(sseBody(parts))) out.push(chunk);
  return out;
}

describe("Azure-Stream", () => {
  it("liest Text über Zeilengrenzen hinweg", async () => {
    const parts = ['data: {"choices":[{"delta":{"content":"Hal"}}]}\n\ndata: {"choi', 'ces":[{"delta":{"content":"lo"}}]}\n\ndata: [DONE]\n\n'];
    expect(await collect(parts)).toEqual([{ type: "text", text: "Hal" }, { type: "text", text: "lo" }]);
  });

  it("setzt Werkzeug-Aufrufe aus Stücken zusammen", async () => {
    const delta = (d: object) => `data: ${JSON.stringify({ choices: [{ delta: d }] })}\n\n`;
    const parts = [
      delta({ tool_calls: [{ index: 0, id: "call_1", function: { name: "get_today", arguments: "" } }] }),
      delta({ tool_calls: [{ index: 1, id: "call_2", function: { name: "find_", arguments: '{"que' } }] }),
      delta({ tool_calls: [{ index: 1, function: { name: "tariff", arguments: 'ry":"Giga"}' } }] }),
      "data: [DONE]\n\n",
    ];
    expect(await collect(parts)).toEqual([
      { type: "tool", call: { id: "call_1", name: "get_today", arguments: "" } },
      { type: "tool", call: { id: "call_2", name: "find_tariff", arguments: '{"query":"Giga"}' } },
    ]);
  });
});
