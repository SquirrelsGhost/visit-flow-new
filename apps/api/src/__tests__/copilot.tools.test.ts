import request from "supertest";
import { describe, expect, it } from "vitest";
import { copilotChatInputSchema } from "@visit-flow/shared/copilotSchema";
import { createApp } from "../app";
import { signAccessToken } from "../lib/auth/accessToken";
import { ConsentService } from "../modules/consent/ConsentService";
import { buildCopilotMessages } from "../modules/copilot/copilotPrompt";
import { createSanitizer } from "../modules/copilot/copilotSanitizer";
import { acceptToolCalls } from "../modules/copilot/copilotToolCalls";
import { CopilotService } from "../modules/copilot/CopilotService";
import type { LlmToolCall } from "../modules/copilot/llm/LlmClient";
import { JWT_SECRET, makeAuth } from "./support/authFakes";
import { fakeLlm, memoryCoachMemories, memoryCopilotLogs } from "./support/copilotFakes";

const env = { JWT_SECRET, CORS_ORIGINS: [], NODE_ENV: "test" as const };
const consent = new ConsentService({ insert: async (e) => e, findByConsentId: async () => [] });
const token = `Bearer ${signAccessToken({ id: "01900000-0000-7000-8000-000000000001", email: "bea@example.de", role: "berater" }, JWT_SECRET)}`;
const call = (id: string, name: string, args = "{}"): LlmToolCall => ({ id, name, arguments: args });

function setup(chunks: (string | LlmToolCall)[]) {
  const llm = fakeLlm(chunks);
  const logs = memoryCopilotLogs();
  const copilot = new CopilotService({ llm, memories: memoryCoachMemories(), logs });
  return { app: createApp(env, { consent, auth: makeAuth([]).service, copilot }), llm, logs };
}

const events = (text: string) => text.split("\n\n").filter(Boolean).map((block) => JSON.parse(block.replace(/^data: /, "")) as Record<string, unknown>);

describe("Werkzeuge", () => {
  it("lässt nur angebotene Werkzeuge mit gültigen Argumenten durch", () => {
    const calls = [call("1", "get_today"), call("2", "get_team_today"), call("3", "find_tariff", "kaputt"), call("4", "rm_rf"), call("5", "open_page", '{"page":"crm"}')];
    expect(acceptToolCalls(calls, ["get_today", "find_tariff", "open_page"])).toEqual([
      { id: "1", name: "get_today", kind: "read", args: {}, arguments: "{}" },
      { id: "5", name: "open_page", kind: "open", args: { page: "crm" }, arguments: '{"page":"crm"}' },
    ]);
  });

  it("schickt Lese-Aufrufe an die App und wartet auf ihre Ergebnisse", async () => {
    const { app, llm, logs } = setup(["Ich schau nach.", call("c1", "get_open_doors", '{"limit":3}')]);
    const res = await request(app)
      .post("/api/copilot/chat-stream")
      .set("Authorization", token)
      .send({ message: "Wo soll ich hin?", tools: ["get_open_doors", "open_page"] });

    const all = events(res.text);
    expect(all.find((e) => e.type === "tool_calls")).toEqual({
      type: "tool_calls",
      calls: [{ id: "c1", name: "get_open_doors", kind: "read", args: { limit: 3 }, arguments: '{"limit":3}' }],
    });
    expect(all.at(-1)).toMatchObject({ type: "done", final: false, logId: null });
    expect(logs.rows).toHaveLength(0);
    expect(llm.options[0]?.tools?.map((t) => t.function.name)).toEqual(["get_open_doors", "open_page"]);
  });

  it("antwortet mit den Ergebnissen und protokolliert die ganze Antwort", async () => {
    const { app, llm, logs } = setup(["Geh in die Lindenstraße."]);
    const res = await request(app)
      .post("/api/copilot/chat-stream")
      .set("Authorization", token)
      .send({
        message: "Wo soll ich hin?",
        tools: ["get_open_doors"],
        toolRounds: [{ text: "Ich schau nach.", calls: [{ id: "c1", name: "get_open_doors", arguments: "{}" }], results: [{ id: "c1", content: '{"Lindenstraße":6}' }] }],
      });
    expect(events(res.text).at(-1)).toMatchObject({ type: "done", final: true });
    expect(llm.calls[0]?.slice(-2)).toEqual([
      { role: "assistant", content: "Ich schau nach.", tool_calls: [{ id: "c1", type: "function", function: { name: "get_open_doors", arguments: "{}" } }] },
      { role: "tool", tool_call_id: "c1", content: '{"Lindenstraße":6}' },
    ]);
    expect(logs.rows[0]?.reply).toBe("Ich schau nach. Geh in die Lindenstraße.");
  });

  it("gibt in der letzten Runde keine Werkzeuge mehr", async () => {
    const round = { calls: [{ id: "c", name: "get_today", arguments: "{}" }], results: [] };
    const { app, llm } = setup([call("x", "get_today"), "Fertig."]);
    const res = await request(app)
      .post("/api/copilot/chat")
      .set("Authorization", token)
      .send({ message: "Zahlen?", tools: ["get_today"], toolRounds: [round, round, round] });
    expect(res.body.data).toMatchObject({ final: true, toolCalls: [] });
    expect(llm.options[0]?.tools).toEqual([]);
  });

  it("Speichern-Werkzeuge beenden die Runde, die App fragt den Nutzer", async () => {
    const { app } = setup(["Ich hab dir den Termin vorbereitet.", call("t", "schedule_appointment", '{"date":"2026-10-25","time":"18:00"}')]);
    const res = await request(app).post("/api/copilot/chat").set("Authorization", token).send({ message: "Erinner mich morgen um 18 Uhr", tools: ["schedule_appointment"] });
    expect(res.body.data).toMatchObject({ final: true, logId: expect.any(String), toolCalls: [{ name: "schedule_appointment", kind: "confirm" }] });
  });

  it("nennt dem Modell das heutige Datum und erklärt die Werkzeuge nur, wenn es welche gibt", () => {
    const base = { role: "berater", memories: [], liked: [], now: new Date("2026-10-24T22:30:00Z"), sanitizer: createSanitizer() };
    const withTools = buildCopilotMessages({ ...base, input: copilotChatInputSchema.parse({ message: "Hi", tools: ["get_today"] }) });
    const without = buildCopilotMessages({ ...base, input: copilotChatInputSchema.parse({ message: "Hi" }) });
    expect(withTools[0]?.content).toContain("2026-10-25");
    expect(withTools[0]?.content).toContain("WERKZEUGE");
    expect(without[0]?.content).toContain("[[NAV:/pfad]]");
  });

  it("lehnt unbekannte Werkzeuge in der Anfrage ab", async () => {
    const { app } = setup(["Hi"]);
    const res = await request(app).post("/api/copilot/chat").set("Authorization", token).send({ message: "Hi", tools: ["delete_everything"] });
    expect(res.status).toBe(400);
  });
});
