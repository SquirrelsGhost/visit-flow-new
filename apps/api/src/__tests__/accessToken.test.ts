import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { bearerToken, signAccessToken, verifyAccessToken } from "../lib/auth/accessToken";
import { newId } from "../lib/db/ids";

const SECRET = "s".repeat(40);

describe("Access-Token", () => {
  it("liest das Format von v1 (generateToken in middleware/auth.ts) mit einer v2-UUID", () => {
    const id = newId();
    const token = jwt.sign({ id, email: "berater@example.com", role: "berater" }, SECRET, { expiresIn: "15m" });
    expect(verifyAccessToken(token, SECRET)).toEqual({ id, email: "berater@example.com", role: "berater" });
  });

  it("lehnt alte v1-Tokens mit ObjectId ab, damit der Client per Refresh-Cookie ein neues holt", () => {
    const v1Token = jwt.sign({ id: "64f0c0ffee0000000000abcd", email: "berater@example.com", role: "berater" }, SECRET, { expiresIn: "15m" });
    expect(verifyAccessToken(v1Token, SECRET)).toBeNull();
  });

  it("stellt Tokens aus, die v1 lesen kann", () => {
    const token = signAccessToken({ id: "u1", email: "tl@example.com", role: "teamleiter" }, SECRET);
    expect(jwt.verify(token, SECRET)).toMatchObject({ id: "u1", email: "tl@example.com", role: "teamleiter" });
  });

  it("lehnt falsche Schlüssel, abgelaufene Tokens, unbekannte Rollen und alg=none ab", () => {
    const user = { id: newId(), email: "a@example.com" };
    expect(verifyAccessToken(jwt.sign({ ...user, role: "berater" }, "x".repeat(40)), SECRET)).toBeNull();
    expect(verifyAccessToken(jwt.sign({ ...user, role: "berater" }, SECRET, { expiresIn: -10 }), SECRET)).toBeNull();
    expect(verifyAccessToken(jwt.sign({ ...user, role: "superadmin" }, SECRET), SECRET)).toBeNull();
    expect(verifyAccessToken(jwt.sign({ ...user, role: "admin" }, "", { algorithm: "none" }), SECRET)).toBeNull();
  });

  it("liest nur echte Bearer-Header", () => {
    expect(bearerToken("Bearer abc")).toBe("abc");
    expect(bearerToken("Basic abc")).toBeNull();
    expect(bearerToken("Bearer ")).toBeNull();
    expect(bearerToken(undefined)).toBeNull();
  });
});
