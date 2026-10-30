import { describe, expect, it } from "vitest";
import { applyHouseStatus, houseFromDraft } from "../hooks/useMapHouses";
import type { DraftHouse } from "../lib/map/mapTypes";
import { buildSyncPayload } from "../lib/map/visitSync";
import { draftAddressError, localDate, stepForStatus, visitComment } from "../lib/map/visitSteps";

const DRAFT: DraftHouse = {
  lng: 6.95,
  lat: 50.94,
  street: "Domkloster",
  houseNumber: "4",
  zipCode: "50667",
  city: "Köln",
  type: "EFH",
  doorName: "",
};

describe("Status-Schritte wie v1", () => {
  it("führt Termin, Versorgt, Kein Interesse und Nicht angetroffen durch eine Abfrage", () => {
    expect(stepForStatus("Angetroffen → Termin", "telco")).toBe("appointment");
    expect(stepForStatus("Angetroffen → Versorgt", "telco")).toBe("supplied");
    expect(stepForStatus("Angetroffen → Kein Interesse", "energy")).toBe("nointerest");
    expect(stepForStatus("N/A", "telco")).toBe("nothome");
  });

  it("speichert Solar-Unpassend und Verkauf ohne Zwischenschritt", () => {
    expect(stepForStatus("Angetroffen → Versorgt", "solar")).toBeNull();
    expect(stepForStatus("Angetroffen → Sale", "telco")).toBe("sale");
  });

  it("verlangt eine vollständige Adresse", () => {
    expect(draftAddressError(DRAFT)).toBeNull();
    expect(draftAddressError({ ...DRAFT, zipCode: " " })).toBe("Postleitzahl ist erforderlich");
  });

  it("baut den Besuchskommentar wie v1", () => {
    expect(visitComment({ reason: "Zu teuer", comment: "Telekom" })).toBe("Grund: Zu teuer | Notiz: Telekom");
    expect(visitComment({ suppliedUntilDate: "2027-05-01" })).toBe("Versorgt bis: 2027-05-01");
  });

  it("nimmt das Datum in Ortszeit", () => {
    expect(localDate(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
  });
});

describe("Häuser speichern", () => {
  it("legt ein neues Haus mit Tür und Termin-Angaben an", () => {
    const house = houseFromDraft(DRAFT, "Angetroffen → Termin", "Notiz", { appointmentDate: "2026-10-24", appointmentTime: "10:00" });
    expect(house.doors).toHaveLength(1);
    expect(house.doors[0]).toMatchObject({ name: "Haupteingang", appointmentDate: "2026-10-24", appointmentTime: "10:00" });
  });

  it("setzt beim EFH auch die Tür, beim MFH nur die Partei", () => {
    const efh = applyHouseStatus(houseFromDraft(DRAFT, "N/A", ""), "Angetroffen → Sale", null, "");
    expect(efh.doors[0]?.status).toBe("Angetroffen → Sale");

    const mfh = houseFromDraft({ ...DRAFT, type: "MFH", doorName: "EG li." }, "N/A", "");
    const next = applyHouseStatus(mfh, "Angetroffen → Termin", "1. OG re.", "");
    expect(next.doors.map((d) => d.name).sort()).toEqual(["1. OG re.", "EG li."]);
    expect(next.status).toBe("Angetroffen → Termin");
  });

  it("schickt Adresse, Haus, Besuch und Tür mit festen Schlüsseln an den Server", () => {
    const payload = buildSyncPayload(houseFromDraft(DRAFT, "Angetroffen → Kein Interesse", "Grund: Zu teuer"));
    expect(payload.address).toMatchObject({ street: "Domkloster", zipCode: "50667", city: "Köln" });
    expect(payload.houseRecord.addressId).toBe(payload.address.id);
    expect(payload.visit).toMatchObject({ houseId: payload.houseRecord.id, status: "Angetroffen → Kein Interesse" });
    expect(payload.doors[0]).toMatchObject({ visitId: payload.visit.id, street: "Domkloster", houseNumber: "4" });
    expect(buildSyncPayload(payload.house).visit.id).toBe(payload.visit.id);
  });
});
