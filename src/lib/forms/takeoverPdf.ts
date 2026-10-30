import { germanDate, isoToGerman } from "./formDates";
import { check, checkOption, drawSignature, setText } from "./pdfFields";
import type { TakeoverData, TakeoverParty, TakeoverSalutation } from "./formTypes";
import { compactIban, fullName } from "./takeoverForm";

/** Vorlage aus v1 (public/pdfs). */
export const TAKEOVER_TEMPLATE = "/pdfs/Vertragsuebernahme.pdf";

/** Reihenfolge der Anrede-Kästchen im PDF: Frau, Herr, Keine Anrede, Firma. */
const SALUTATION_INDEX: Record<TakeoverSalutation, number> = { "": -1, Frau: 0, Herr: 1, Divers: 2, Firma: 3 };

function fillPrevious(form: Parameters<typeof setText>[0], p: TakeoverParty) {
  setText(form, "bisherig_Name_Firma 2", p.name);
  setText(form, "bisherig_Vorname 2", p.firstName);
  setText(form, "bisherig_Straße 2", p.street);
  setText(form, "bisherig_Hausnummer 2", p.houseNumber);
  setText(form, "bisherig_PLZ 2", p.zip);
  setText(form, "bisherig_Ort 2", p.city);
}

function fillNext(form: Parameters<typeof setText>[0], p: TakeoverParty) {
  setText(form, "zukünftig_Name_Firma 1", p.name);
  setText(form, "zukünftig_Vorname 1", p.firstName);
  setText(form, "zukünftig_Straße 1", p.street);
  setText(form, "zukünftiger_Hausnummer 1", p.houseNumber);
  setText(form, "zuküntiger_PLZ 1", p.zip);
  setText(form, "zuküntiger_Ort 1", p.city);
}

/**
 * Füllt die Vertragsübernahme wie v1 (pdfGeneratorVertragsuebernahme.ts), mit drei Korrekturen:
 * "schnellstmöglich" ist im aktuellen PDF das Kästchen "Wunschtermin" (v1 malte ein X auf das Deckblatt),
 * das Telefon des neuen Kunden gehört in dessen eigenes Feld, und Unterschriften stehen dort, wo das Feld ist.
 * Die freiwillige Werbe-Einwilligung (8.2) wird bewusst nicht automatisch unterschrieben.
 */
export async function fillTakeoverPdf(template: ArrayBuffer | Uint8Array, data: TakeoverData, today: Date): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(template);
  const form = doc.getForm();
  const date = germanDate(today);
  const nextName = fullName(data.next);

  fillPrevious(form, data.previous);
  setText(form, "Kundennummer", data.customerNumber);
  if (data.deceased) check(form, "bisherige Vertragspartner");
  else setText(form, "Datum_Unterschrift_bisheriger_Vertragspartner 6", date);

  if (data.timing === "date") setText(form, "Datum_Wunschtermin 2", isoToGerman(data.date));
  else check(form, "Wunschtermin");

  checkOption(form, "Anrede Auswahl", SALUTATION_INDEX[data.salutation]);
  fillNext(form, data.next);
  setText(form, "Geburtsdatum_Jahr 1", data.birthYear);
  setText(form, "zukünftig_Kontakttelefonnummer 1", data.phone);
  setText(form, "E-Mail-Adresse", data.email);
  setText(form, "Rechnungszustellung 1", data.email);
  setText(form, "Datum_Unterschrift_zukünftiger", date);
  setText(form, "Name in Druckbuchstaben", nextName);

  // SEPA-Mandat (letzte Seite)
  const holder = data.bankHolder.trim() || nextName;
  setText(form, "Kundennummer/Rufnummer 2", data.customerNumber);
  setText(form, "E-Mail-Adresse 2", data.email);
  if (data.bankHolder.trim()) setText(form, "Vertragsinhaber", nextName);
  setText(form, "Name", holder);
  setText(form, "Straße", data.next.street);
  setText(form, "Hausnummer", data.next.houseNumber);
  setText(form, "Postleitzahl", data.next.zip);
  setText(form, "Ort", data.next.city);
  setText(form, "Land", "Deutschland");
  setText(form, "IBAN", compactIban(data.iban));
  setText(form, "BIC", data.bic.toUpperCase());
  setText(form, "Datum", date);

  if (!data.deceased) await drawSignature(doc, "Unterschrift 7", data.previousSignature);
  await drawSignature(doc, "Unterschrift_zukünftig", data.nextSignature);
  await drawSignature(doc, "Unterschrift", data.nextSignature);
  return doc.save();
}
