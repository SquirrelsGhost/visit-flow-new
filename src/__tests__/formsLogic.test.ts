import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { changeFileName, changeProblem, emptyChange, toggleArea } from "../lib/forms/changeForm";
import { fillChangePdf } from "../lib/forms/changePdf";
import { filterForms } from "../lib/forms/formCatalog";
import { germanDate, isoToGerman } from "../lib/forms/formDates";
import type { TakeoverData } from "../lib/forms/formTypes";
import { emptyTakeover, takeoverProblem, vodafoneTakeoverLink } from "../lib/forms/takeoverForm";
import { fillTakeoverPdf } from "../lib/forms/takeoverPdf";
import { formTextsDe } from "../texts/formTextsDe";

const pdf = (name: string) => new Uint8Array(readFileSync(resolve(process.cwd(), `public/pdfs/${name}.pdf`)));
const TODAY = new Date(2026, 9, 24);
/** 1x1 Pixel als PNG-Daten-URL (statt einer gezeichneten Unterschrift). */
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

function takeover(patch: Partial<TakeoverData> = {}): TakeoverData {
  const base = emptyTakeover();
  return {
    ...base,
    customerNumber: "123456789",
    previous: { name: "Muster", firstName: "Max", street: "Hauptstr.", houseNumber: "5", zip: "50667", city: "Köln" },
    next: { name: "Muster", firstName: "Erika", street: "Ringweg", houseNumber: "2a", zip: "40210", city: "Düsseldorf" },
    salutation: "Frau",
    phone: "0170 1234567",
    email: "erika@example.de",
    iban: "de89 3704 0044 0532 0130 00",
    ...patch,
  };
}

describe("Formulare: Daten und Prüfung", () => {
  it("belegt die Änderungsmitteilung wie v1 aus dem Benutzer vor", () => {
    const data = emptyChange({ id: "1", email: "a@b.de", role: "user", name: "Anna Maria Berg", vpkn: "V123" });
    expect(data).toMatchObject({ vpkn: "V123", firstName: "Anna", lastName: "Maria Berg", email: "a@b.de", areas: [] });
    expect(changeFileName(data)).toBe("Aenderungsmitteilung_V123.pdf");
  });

  it("verlangt mindestens einen Bereich und hält die Reihenfolge des PDFs", () => {
    const data = emptyChange(null);
    expect(changeProblem(data)).toBe("noArea");
    expect(toggleArea(["bank"], "name")).toEqual(["name", "bank"]);
    expect(toggleArea(["name", "bank"], "name")).toEqual(["bank"]);
    expect(changeProblem({ ...data, areas: ["bank"] })).toBe("noIdentity");
    expect(changeProblem({ ...data, areas: ["bank"], lastName: "Berg" })).toBeNull();
  });

  it("prüft die Vertragsübernahme vor dem Erstellen", () => {
    expect(takeoverProblem(emptyTakeover())).toBe("customerNumber");
    expect(takeoverProblem(takeover())).toBeNull();
    expect(takeoverProblem(takeover({ timing: "date" }))).toBe("date");
    expect(takeoverProblem(takeover({ iban: "DE12" }))).toBe("iban");
  });

  it("baut den Vodafone-Link mit denselben Parametern wie v1", () => {
    const url = new URL(vodafoneTakeoverLink(takeover()));
    expect(url.origin + url.pathname).toBe("https://www.vodafone.de/hilfe/formulare/38");
    expect(url.searchParams.get("kundennummer")).toBe("123456789");
    expect(url.searchParams.get("strasse")).toBe("Hauptstr. 5");
    expect(url.searchParams.getAll("phone")).toEqual(["0170 1234567"]);
  });

  it("filtert die Formulare nach Titel und Beschreibung", () => {
    const describe = (id: "aenderung" | "uebernahme") => formTextsDe.forms[id];
    expect(filterForms("", describe)).toEqual(["aenderung", "uebernahme"]);
    expect(filterForms("todesfall", describe)).toEqual(["uebernahme"]);
    expect(filterForms("xyz", describe)).toEqual([]);
  });

  it("schreibt Daten wie auf dem Formular", () => {
    expect(germanDate(TODAY)).toBe("24.10.2026");
    expect(isoToGerman("2026-11-30")).toBe("30.11.2026");
  });
});

describe("Formulare: PDF ausfüllen", () => {
  it("füllt nur die angekreuzten Bereiche der Änderungsmitteilung", async () => {
    const data = { ...emptyChange(null), vpkn: "V1", firstName: "Anna", lastName: "Berg", areas: ["name", "bank"] as const, salutation: "Frau" as const };
    const bytes = await fillChangePdf(pdf("Aenderungsmitteilung"), { ...data, areas: [...data.areas], newLastName: "Klein", iban: "DE89", street: "Nicht angekreuzt 1" }, TODAY);
    const form = (await PDFDocument.load(bytes)).getForm();
    expect(form.getTextField("VPKN").getText()).toBe("V1");
    expect(form.getTextField("Datum").getText()).toBe("24.10.2026");
    expect(form.getTextField("Name_2").getText()).toBe("Klein");
    expect(form.getDropdown("Anrede").getSelected()).toEqual(["Frau"]);
    expect(form.getCheckBox("Bankverbindung").isChecked()).toBe(true);
    expect(form.getCheckBox("Adresse").isChecked()).toBe(false);
    expect(form.getTextField("Str  Hausnr").getText()).toBeUndefined();
  });

  it("füllt die Vertragsübernahme samt Anrede, Termin, SEPA und Unterschriften", async () => {
    const bytes = await fillTakeoverPdf(pdf("Vertragsuebernahme"), takeover({ previousSignature: PNG, nextSignature: PNG }), TODAY);
    const form = (await PDFDocument.load(bytes)).getForm();
    expect(form.getTextField("bisherig_Hausnummer 2").getText()).toBe("5");
    expect(form.getTextField("zukünftig_Kontakttelefonnummer 1").getText()).toBe("0170 1234567");
    expect(form.getTextField("Kontakttelefonnr").getText()).toBeUndefined();
    expect(form.getCheckBox("Wunschtermin").isChecked()).toBe(true);
    expect(form.getCheckBox("Anrede Auswahl").acroField.getValue().toString()).toBe("/Frau");
    expect(form.getTextField("IBAN").getText()).toBe("DE89370400440532013000");
    expect(form.getTextField("Name").getText()).toBe("Erika Muster");
    expect(form.getTextField("Datum_Unterschrift_bisheriger_Vertragspartner 6").getText()).toBe("24.10.2026");
  });

  it("setzt beim Wunschtermin nur das Datum und im Todesfall das Kästchen statt Unterschrift", async () => {
    const bytes = await fillTakeoverPdf(pdf("Vertragsuebernahme"), takeover({ timing: "date", date: "2026-12-01", deceased: true }), TODAY);
    const form = (await PDFDocument.load(bytes)).getForm();
    expect(form.getCheckBox("Wunschtermin").isChecked()).toBe(false);
    expect(form.getTextField("Datum_Wunschtermin 2").getText()).toBe("01.12.2026");
    expect(form.getCheckBox("bisherige Vertragspartner").isChecked()).toBe(true);
    expect(form.getTextField("Datum_Unterschrift_bisheriger_Vertragspartner 6").getText()).toBeUndefined();
  });
});
