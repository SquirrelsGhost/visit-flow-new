import { describe, expect, it } from "vitest";
import { isUuid, newId } from "../lib/db/ids";

describe("newId", () => {
  it("erzeugt UUIDv7, die nach Zeit sortiert sind", () => {
    const early = newId(Date.parse("2025-01-01"));
    const late = newId(Date.parse("2026-01-01"));
    expect(early).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(early < late).toBe(true);
    expect(newId()).not.toBe(newId());
  });

  it("erkennt UUIDs und lehnt ObjectIds ab", () => {
    expect(isUuid(newId())).toBe(true);
    expect(isUuid("65f000000000000000000001")).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});
