import { PDFName, type PDFDocument, type PDFForm } from "pdf-lib";

/**
 * Kleine, fehlertolerante Helfer zum Ausfüllen der Vodafone-PDFs (wie v1): fehlt ein Feld in einer
 * neueren Fassung des Formulars, bleibt es leer, statt das ganze PDF scheitern zu lassen.
 */
export function setText(form: PDFForm, name: string, value: string | undefined): void {
  const text = value?.trim();
  if (!text) return;
  try {
    form.getTextField(name).setText(text);
  } catch {
    // Feld gibt es in dieser Fassung nicht
  }
}

export function check(form: PDFForm, name: string): void {
  try {
    form.getCheckBox(name).check();
  } catch {
    // Feld gibt es in dieser Fassung nicht
  }
}

export function select(form: PDFForm, name: string, value: string): void {
  if (!value) return;
  try {
    form.getDropdown(name).select(value);
  } catch {
    // Feld oder Wert gibt es in dieser Fassung nicht
  }
}

/** Kreuzt bei einem Kästchen mit mehreren Feldern (z. B. Anrede) das n-te an. */
export function checkOption(form: PDFForm, name: string, index: number): void {
  if (index < 0) return;
  try {
    const field = form.getCheckBox(name).acroField;
    const onValue = field.getWidgets()[index]?.getOnValue();
    if (onValue instanceof PDFName) field.setValue(onValue);
  } catch {
    // Feld gibt es in dieser Fassung nicht
  }
}

/** Höhe der Unterschrift über einer Linie; die Felder im PDF sind nur eine Zeile hoch. */
const SIGNATURE_HEIGHT = 46;
/** Ab dieser Höhe ist das Feld ein Kasten (SEPA), die Unterschrift passt dann hinein. */
const BOX_HEIGHT = 30;

/**
 * Setzt die gezeichnete Unterschrift (PNG als Daten-URL) auf die Linie eines Unterschriftsfelds.
 * Seite und Lage kommen aus dem Feld selbst, nicht aus festen Koordinaten wie in v1.
 */
export async function drawSignature(doc: PDFDocument, fieldName: string, png: string | null): Promise<void> {
  if (!png) return;
  try {
    const widget = doc.getForm().getField(fieldName).acroField.getWidgets()[0];
    const page = doc.getPages().find((p) => p.ref === widget?.P());
    if (!widget || !page) return;
    const rect = widget.getRectangle();
    const image = await doc.embedPng(png);
    const box = rect.height > BOX_HEIGHT;
    const height = box ? rect.height - 6 : SIGNATURE_HEIGHT;
    const width = Math.min(rect.width, (height * image.width) / image.height);
    page.drawImage(image, { x: rect.x + 4, y: box ? rect.y + 3 : rect.y - 4, width, height: (width * image.height) / image.width });
  } catch {
    // Unterschrift kann dann von Hand ergänzt werden
  }
}
