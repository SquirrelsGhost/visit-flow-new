import { CHANGE_CHECKBOX } from "./changeForm";
import { germanDate } from "./formDates";
import { check, select, setText } from "./pdfFields";
import type { ChangeData } from "./formTypes";

/** Vorlage aus v1 (public/pdfs). */
export const CHANGE_TEMPLATE = "/pdfs/Aenderungsmitteilung.pdf";

/** Füllt die Änderungsmitteilung wie v1 (pdfGenerator.ts); nur angekreuzte Bereiche landen im PDF. */
export async function fillChangePdf(template: ArrayBuffer | Uint8Array, data: ChangeData, today: Date): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(template);
  const form = doc.getForm();
  const on = (area: ChangeData["areas"][number]) => data.areas.includes(area);

  setText(form, "VPKN", data.vpkn);
  setText(form, "Vorname", data.firstName);
  setText(form, "Nachname", data.lastName);
  setText(form, "Datum", germanDate(today));
  setText(form, "Unterschrift VodafoneBeraterin", `${data.firstName} ${data.lastName}`);
  data.areas.forEach((area) => check(form, CHANGE_CHECKBOX[area]));

  if (on("name")) {
    select(form, "Anrede", data.salutation);
    setText(form, "Firmenbezeichnung", data.company);
    setText(form, "Name_2", data.newLastName);
    setText(form, "Vorname_2", data.newFirstName);
  }
  if (on("address")) {
    setText(form, "Str  Hausnr", data.street);
    setText(form, "PLZ  Ort", data.zipCity);
  }
  if (on("contact")) {
    setText(form, "Telefonnummer", data.phone);
    setText(form, "MobilfunkNr_2", data.mobile);
    setText(form, "EMailAdresse", data.email);
  }
  if (on("bank")) {
    setText(form, "Kontoinhaberin", data.accountHolder);
    setText(form, "IBAN", data.iban);
    setText(form, "BIC", data.bic);
    setText(form, "Bank", data.bank);
  }
  if (on("tax")) {
    setText(form, "Finanzamt", data.taxOffice);
    setText(form, "UStIdNr", data.vatId);
    setText(form, "SteuerNr", data.taxNumber);
  }
  if (on("other")) setText(form, "sonstiges", data.otherText);
  return doc.save();
}
