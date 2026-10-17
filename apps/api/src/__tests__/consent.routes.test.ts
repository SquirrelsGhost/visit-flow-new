import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { CONSENT_VERSION } from "@visit-flow/shared/consent";
import { createApp } from "../app";
import type { ConsentLogDoc } from "../modules/consent/ConsentLog.model";
import type { ConsentRepository } from "../modules/consent/ConsentRepository";
import { ConsentService } from "../modules/consent/ConsentService";
import { makeAuth } from "./support/authFakes";

const env = { JWT_SECRET: "s".repeat(40), CORS_ORIGINS: ["http://localhost:5173"], NODE_ENV: "test" as const };
const auth = makeAuth([]).service;

function memoryRepository(): ConsentRepository & { rows: ConsentLogDoc[] } {
  const rows: ConsentLogDoc[] = [];
  return {
    rows,
    insert: async (entry) => (rows.push(entry), entry),
    findByConsentId: async (consentId) => rows.filter((row) => row.consentId === consentId),
  };
}

describe("POST /api/consent", () => {
  let repository: ReturnType<typeof memoryRepository>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = memoryRepository();
    app = createApp(env, { consent: new ConsentService(repository), auth });
  });

  it("protokolliert ohne Login und ohne IP oder User-Agent", async () => {
    const response = await request(app)
      .post("/api/consent")
      .set("User-Agent", "Mozilla/5.0 Test")
      .send({ id: "abc-12345", v: CONSENT_VERSION, choice: { extern: false }, source: "banner" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, data: { consentId: "abc-12345", version: CONSENT_VERSION } });
    expect(repository.rows).toHaveLength(1);
    expect(JSON.stringify(repository.rows[0])).not.toMatch(/Mozilla|127\.0\.0\.1|ipAddress|userAgent/);
  });

  it("speichert die aktuelle Version und lehnt veraltete ab", async () => {
    const response = await request(app).post("/api/consent").send({ id: "abc-12345", v: 0, choice: { extern: true }, source: "banner" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, error: expect.any(String), message: expect.any(String) });
    expect(repository.rows).toHaveLength(0);
  });

  it("liefert den Verlauf zu einer Einwilligungs-ID", async () => {
    await request(app).post("/api/consent").send({ id: "abc-12345", v: CONSENT_VERSION, choice: { extern: true }, source: "banner" });
    const response = await request(app).get("/api/consent/abc-12345");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});

describe("App-Grundlagen", () => {
  const app = createApp(env, { consent: new ConsentService(memoryRepository()), auth });

  it("antwortet bei unbekannten Pfaden mit err()", async () => {
    const response = await request(app).get("/api/gibt-es-nicht");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, error: "Endpunkt nicht gefunden", message: "Endpunkt nicht gefunden" });
  });

  it("setzt Security-Header und verrät kein Express", async () => {
    const response = await request(app).get("/api/gibt-es-nicht");
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["content-security-policy"]).toContain("default-src 'none'");
  });

  it("lehnt die Origin null ab und erlaubt konfigurierte Origins", async () => {
    const blocked = await request(app).get("/api/gibt-es-nicht").set("Origin", "null");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
    const allowed = await request(app).get("/api/gibt-es-nicht").set("Origin", "http://localhost:5173");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });
});
