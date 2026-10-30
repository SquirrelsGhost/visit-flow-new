import { describe, expect, it } from "vitest";
import type { AuthUser } from "@/shared/auth/authSchemas";
import { streetScopeFor } from "../lib/streets/streetScope";
import {
  crmHref,
  crmTargetFor,
  onStreet,
  sameStreet,
  streetListHref,
  streetListViewFor,
  streetQuery,
  streetRefFromParams,
  streetRefOfAddress,
} from "../lib/streets/streetLinks";

const user = (role: string, roles: string[] = []) => ({ id: "u1", email: "u@x.de", role, roles }) as unknown as AuthUser;

describe("Straße aus einer CRM-Adresse", () => {
  it("trennt Hausnummer, PLZ und Ort ab", () => {
    expect(streetRefOfAddress("Lindenstraße 4, 50667 Köln")).toEqual({ street: "Lindenstraße", zipCode: "50667", city: "Köln" });
    expect(streetRefOfAddress("Am Stadtpark 7a, 53111 Bonn")).toEqual({ street: "Am Stadtpark", zipCode: "53111", city: "Bonn" });
    expect(streetRefOfAddress("Hauptstraße 12 - 14")).toEqual({ street: "Hauptstraße", zipCode: "", city: "" });
    expect(streetRefOfAddress("Königsallee, Düsseldorf")).toEqual({ street: "Königsallee", zipCode: "", city: "Düsseldorf" });
  });

  it("liefert ohne Straße nichts", () => {
    expect(streetRefOfAddress("")).toBeNull();
    expect(streetRefOfAddress(", 50667 Köln")).toBeNull();
  });
});

describe("gleiche Straße", () => {
  const linden = { street: "Lindenstraße", zipCode: "50667", city: "Köln" };
  it("vergleicht ohne Groß-/Kleinschreibung und mit Str.-Kurzform", () => {
    expect(sameStreet({ street: "lindenstr.", zipCode: "50667", city: "" }, linden)).toBe(true);
    expect(sameStreet({ street: "Lindenstrasse", zipCode: "", city: "köln" }, linden)).toBe(true);
  });
  it("unterscheidet gleiche Namen in anderen Orten", () => {
    expect(sameStreet({ street: "Lindenstraße", zipCode: "40210", city: "Düsseldorf" }, linden)).toBe(false);
    expect(onStreet("Lindenstraße 9, 40210 Düsseldorf", linden)).toBe(false);
    expect(onStreet("Lindenstraße 9, 50667 Köln", linden)).toBe(true);
    expect(onStreet("", linden)).toBe(false);
    expect(onStreet("", null)).toBe(true);
  });
});

describe("Links zwischen Straßenliste und CRM", () => {
  const ref = { street: "Lindenstraße", zipCode: "50667", city: "Köln" };

  it("schreibt und liest die Straße in der Adresse", () => {
    expect(streetRefFromParams(new URLSearchParams(streetQuery(ref)))).toEqual(ref);
    expect(streetRefFromParams(new URLSearchParams("strasse=%20"))).toBeNull();
  });

  it("Straßenliste je Rolle, Berater keine", () => {
    expect(streetListViewFor(user("admin"))).toBe("admin");
    expect(streetListViewFor(user("berater", ["strukturleiter"]))).toBe("struktur");
    expect(streetListViewFor(user("berater", ["mentor"]))).toBe("mentor");
    expect(streetListViewFor(user("berater"))).toBeNull();
    expect(streetListViewFor(user("teamleiter"))).toBeNull();
    expect(streetListHref("struktur", ref)).toBe("/strukturleiter-street-list?strasse=Lindenstra%C3%9Fe&plz=50667&ort=K%C3%B6ln");
  });

  it("Verkäufe: Admin-Liste → CRM-Übersicht, Teamleitung → Backoffice, sonst eigene Aufträge", () => {
    expect(crmTargetFor("admin", user("admin"))).toEqual({ route: "/admin-crm-overview", own: false });
    expect(crmTargetFor("struktur", user("admin"))).toEqual({ route: "/team-backoffice", own: false });
    expect(crmTargetFor("struktur", user("teamleiter", ["strukturleiter"]))).toEqual({ route: "/team-backoffice", own: false });
    expect(crmTargetFor("mentor", user("berater", ["mentor"]))).toEqual({ route: "/crm", own: true });
    expect(crmHref(crmTargetFor("mentor", user("berater", ["mentor"])), ref)).toBe("/crm?strasse=Lindenstra%C3%9Fe&plz=50667&ort=K%C3%B6ln");
    expect(streetScopeFor("admin", user("admin"), false).crm.route).toBe("/admin-crm-overview");
  });
});
