import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { signAccessToken } from "../lib/auth/accessToken";
import { ConsentService } from "../modules/consent/ConsentService";
import { copilotPrivacy } from "../modules/copilot/copilotPrivacy";
import { CopilotService } from "../modules/copilot/CopilotService";
import type { LlmChunk, LlmClient } from "../modules/copilot/llm/LlmClient";
import { JWT_SECRET, makeAuth } from "./support/authFakes";
import { fakeLlm, memoryCoachMemories, memoryCopilotLogs } from "./support/copilotFakes";

const env = { JWT_SECRET, CORS_ORIGINS: [], NODE_ENV: "test" as const };
const consent = new ConsentService({ insert: async (e) => e, findByConsentId: async () => [] });
const bea = { id: "64b000000000000000000001", email: "bea@example.de", role: "berater" as const };
const token = `Bearer ${signAccessToken(bea, JWT_SECRET)}`;

function setup(llm: LlmClient | null) {
  const memories = memoryCoachMemories();
  const logs = memoryCopilotLogs();
  const copilot = new CopilotService({ llm, memories, logs });
  const app = createApp(env, { consent, auth: makeAuth([]).service, copilot });
  return { app, memories, logs };
}

/** Zerlegt eine SSE-Antwort in ihre Events. */
const events = (text: string) => text.split("\n\n").filter(Boolean).map((block) => JSON.parse(block.replace(/^data: /, "")) as Record<string, unknown>);

describe("POST /api/copilot/chat-stream", () => {
  let llm: ReturnType<typeof fakeLlm>;
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    llm = fakeLlm(["Stark, Agent! ", "Sag: \"Darf ich kurz zeigen, ", "was Sie sparen?\" [[NAV:/statistics]]", " [[MERKEN:weakspot|Tut sich mit Preiseinwänden schwer]]"]);
    ctx = setup(llm);
  });

  it("streamt Tokens ohne Marker, setzt den Namen zurück und lernt dazu", async () => {
    const res = await request(ctx.app)
      .post("/api/copilot/chat-stream")
      .set("Authorization", token)
      .send({ message: "Merk dir, dass ich lieber abends laufe", userName: "Bea Berater", vertical: "telco" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    const all = events(res.text);
    const text = all.filter((e) => e.type === "token").map((e) => e.text).join("");
    expect(text).toBe("Stark, Bea! Sag: \"Darf ich kurz zeigen, was Sie sparen?\"");
    expect(all.at(-1)).toMatchObject({ type: "done", action: "NAVIGATE", path: "/statistics", intent: "chat", remembered: 2 });
    expect(ctx.memories.rows.map((m) => [m.kind, m.source, m.content])).toEqual([
      ["weakspot", "enes", "Tut sich mit Preiseinwänden schwer"],
      ["preference", "user", "ich lieber abends laufe"],
    ]);
    // Name des Beraters geht nie ans Modell
    expect(JSON.stringify(llm.calls)).not.toContain("Bea");
    expect(ctx.logs.rows[0]?.reply).toBe(text);
  });

  it("antwortet ohne Modell mit 503, damit die App lokal antwortet", async () => {
    const offline = setup(null);
    const res = await request(offline.app).post("/api/copilot/chat-stream").set("Authorization", token).send({ message: "Hallo" });
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ success: false });
  });

  it("verlangt Login und prüft die Eingabe", async () => {
    expect((await request(ctx.app).post("/api/copilot/chat-stream").send({ message: "Hallo" })).status).toBe(401);
    expect((await request(ctx.app).post("/api/copilot/chat-stream").set("Authorization", token).send({ message: "" })).status).toBe(400);
  });

  it("meldet einen Modellfehler als error-Event", async () => {
    const failing: AsyncIterable<LlmChunk> = { [Symbol.asyncIterator]: () => ({ next: () => Promise.reject(new Error("kaputt")) }) };
    const broken = setup({ stream: () => failing });
    const res = await request(broken.app).post("/api/copilot/chat-stream").set("Authorization", token).send({ message: "Hallo" });
    expect(events(res.text)).toEqual([{ type: "error", message: expect.any(String) }]);
  });
});

describe("Antwort, Feedback und Gedächtnis", () => {
  it("POST /chat liefert die Antwort am Stück", async () => {
    const { app } = setup(fakeLlm(["Los ", "geht's!"]));
    const res = await request(app).post("/api/copilot/chat").set("Authorization", token).send({ message: "Motivier mich" });
    expect(res.body).toMatchObject({ success: true, data: { reply: "Los geht's!", action: "NONE", path: null } });
  });

  it("speichert 👍 und nutzt es danach als Beispiel im Prompt", async () => {
    const llm = fakeLlm(["Rechne", " die 24 Monate vor."]);
    const { app } = setup(llm);
    const first = await request(app).post("/api/copilot/chat").set("Authorization", token).send({ message: "Einwand zu teuer?" });
    const fb = await request(app).post("/api/copilot/feedback").set("Authorization", token).send({ logId: first.body.data.logId, feedback: "up" });
    expect(fb.body).toEqual({ success: true, data: { saved: true } });
    await request(app).post("/api/copilot/chat").set("Authorization", token).send({ message: "Und jetzt?" });
    expect(llm.calls[1]?.[0]?.content).toContain("Rechne die 24 Monate vor.");
    const unknown = await request(app).post("/api/copilot/feedback").set("Authorization", token).send({ logId: "64b000000000000000000099", feedback: "down" });
    expect(unknown.status).toBe(404);
  });

  it("zeigt, löscht einzeln und vergisst alles", async () => {
    const { app, memories, logs } = setup(fakeLlm(["Ok."]));
    await request(app).post("/api/copilot/chat").set("Authorization", token).send({ message: "Merk dir: mein Ziel sind 30 Abschlüsse" });
    const list = await request(app).get("/api/copilot/memory").set("Authorization", token);
    expect(list.body.data).toEqual([expect.objectContaining({ kind: "preference", content: "mein Ziel sind 30 Abschlüsse" })]);
    const del = await request(app).delete(`/api/copilot/memory/${list.body.data[0].id}`).set("Authorization", token);
    expect(del.body.data).toEqual({ deleted: true });
    await memories.add(bea.id, "fact", "Läuft mit Fahrrad", "user");
    const erase = await request(app).post("/api/copilot/erase-ai-data").set("Authorization", token);
    expect(erase.body.data).toEqual({ memories: 1, conversations: 1 });
    expect(memories.rows).toHaveLength(0);
    expect(logs.rows).toHaveLength(0);
  });

  it("meldet sich für Auskunft und Löschung an", async () => {
    const memories = memoryCoachMemories();
    const logs = memoryCopilotLogs();
    await memories.add(bea.id, "win", "Erster GigaKombi", "enes");
    const privacy = copilotPrivacy(memories, logs);
    expect(await privacy.onUserExport(bea.id)).toMatchObject({ memories: [{ content: "Erster GigaKombi" }], conversations: [] });
    expect(await privacy.onUserDelete(bea.id)).toEqual({ action: "deleted", count: 1 });
  });
});
