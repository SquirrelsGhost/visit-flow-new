import { CHANGE_TEMPLATE, fillChangePdf } from "./changePdf";
import { changeFileName } from "./changeForm";
import type { ChangeData, TakeoverData } from "./formTypes";
import { TAKEOVER_TEMPLATE, fillTakeoverPdf } from "./takeoverPdf";
import { takeoverFileName } from "./takeoverForm";

/** Fertiges PDF mit Dateinamen. */
export interface FilledPdf {
  bytes: Uint8Array;
  fileName: string;
}

async function loadTemplate(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PDF-Vorlage fehlt: ${url}`);
  return response.arrayBuffer();
}

export async function buildChangePdf(data: ChangeData): Promise<FilledPdf> {
  const bytes = await fillChangePdf(await loadTemplate(CHANGE_TEMPLATE), data, new Date());
  return { bytes, fileName: changeFileName(data) };
}

export async function buildTakeoverPdf(data: TakeoverData): Promise<FilledPdf> {
  const bytes = await fillTakeoverPdf(await loadTemplate(TAKEOVER_TEMPLATE), data, new Date());
  return { bytes, fileName: takeoverFileName(data) };
}

/** Lädt das PDF herunter (wie v1 über einen unsichtbaren Link). */
export function downloadPdf({ bytes, fileName }: FilledPdf): void {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Erst nach dem Klick freigeben, sonst bricht Safari den Download ab
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
