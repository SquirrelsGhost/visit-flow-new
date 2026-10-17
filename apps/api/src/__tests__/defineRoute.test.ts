import express, { Router } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { signAccessToken } from "../lib/auth/accessToken";
import { defineRoute } from "../lib/http/defineRoute";
import { conflict } from "../lib/http/HttpError";
import { errorHandler } from "../lib/http/errorHandler";

const deps = { jwtSecret: "s".repeat(40) };
const token = (role: "berater" | "teamleiter" | "admin") => `Bearer ${signAccessToken({ id: "u1", email: "u1@example.com", role }, deps.jwtSecret)}`;

function testApp() {
  const router = Router();
  defineRoute(router, deps, {
    method: "post",
    path: "/teams/:teamId",
    auth: "teamleiter",
    params: z.object({ teamId: z.string().length(4) }),
    body: z.object({ name: z.string().min(2) }).strict(),
    handler: async ({ params, body, user }) => ({ teamId: params.teamId, name: body.name, by: user.role }),
  });
  defineRoute(router, deps, {
    method: "get",
    path: "/conflict",
    auth: "berater",
    handler: async () => {
      throw conflict("Version veraltet");
    },
  });
  const app = express();
  app.use(express.json());
  app.use(router);
  app.use(errorHandler);
  return app;
}

describe("defineRoute", () => {
  const app = testApp();

  it("verlangt einen Login", async () => {
    expect((await request(app).post("/teams/t001").send({ name: "Nord" })).status).toBe(401);
  });

  it("prüft die Mindestrolle", async () => {
    const response = await request(app).post("/teams/t001").set("Authorization", token("berater")).send({ name: "Nord" });
    expect(response.status).toBe(403);
  });

  it("lässt höhere Rollen zu und liefert ok()", async () => {
    const response = await request(app).post("/teams/t001").set("Authorization", token("admin")).send({ name: "Nord" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: { teamId: "t001", name: "Nord", by: "admin" } });
  });

  it("blockt Mass-Assignment über strikte Schemas", async () => {
    const response = await request(app).post("/teams/t001").set("Authorization", token("teamleiter")).send({ name: "Nord", role: "admin" });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("validiert Params", async () => {
    const response = await request(app).post("/teams/zu-lang").set("Authorization", token("teamleiter")).send({ name: "Nord" });
    expect(response.status).toBe(400);
  });

  it("reicht HttpError aus async-Handlern an den Error-Handler weiter", async () => {
    const response = await request(app).get("/conflict").set("Authorization", token("berater"));
    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Version veraltet");
  });
});
