import { describe, expect, it } from "vitest";
import { firstInvalidField, identFieldError, isPersonalDataValid } from "@/lib/security/identWizard";

const TODAY = new Date("2026-10-25T12:00:00");
const VALID = { fullName: "Markus Struktur", birthDate: "1988-05-14", docType: "personalausweis" as const, docNumber: "L01X00T47", authority: "Stadt Stuttgart", address: "Rötestraße 20, 74321 Bietigheim" };

describe("Online-Ident Prüfung der Ausweisdaten", () => {
  it("meldet leere und zu kurze Felder", () => {
    expect(identFieldError("fullName", "  ", TODAY)).toBe("required");
    expect(identFieldError("docNumber", "L01", TODAY)).toBe("tooShort");
    expect(identFieldError("address", "Weg 1", TODAY)).toBe("tooShort");
  });

  it("prüft das Geburtsdatum auf Zukunft und Volljährigkeit", () => {
    expect(identFieldError("birthDate", "2027-01-01", TODAY)).toBe("future");
    expect(identFieldError("birthDate", "2010-01-01", TODAY)).toBe("underage");
    expect(identFieldError("birthDate", "2008-10-25", TODAY)).toBeNull();
  });

  it("findet das erste fehlerhafte Feld in Reihenfolge des Formulars", () => {
    expect(isPersonalDataValid(VALID)).toBe(true);
    expect(firstInvalidField({ ...VALID, authority: "", address: "" })).toBe("authority");
    expect(firstInvalidField(VALID)).toBeNull();
  });
});
