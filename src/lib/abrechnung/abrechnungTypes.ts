/**
 * Datenmodell der Abrechnung, 1:1 nach v1 (server/src/models/AbrechnungUpload.ts).
 * Eine Abrechnung gehört zu einem Monat und einer Kategorie und gleicht die Zeilen der
 * Partner-Abrechnung mit den in der App getrackten Verkäufen ab.
 */

/** v1 kennt "vodafone" (Telco) und "leads" (Solar). "energy" gibt es erst in v2 und bisher nur im Demo-Modus. */
export type AbrechnungCategory = "vodafone" | "leads" | "energy";

export type ItemStatus =
  | "matched"
  | "missing_in_pdf"
  | "missing_in_system"
  | "amount_mismatch"
  | "pending"
  | "cross_matched";

export type RecordStatus = "pending" | "matched" | "discrepancy" | "reklamiert";

export interface AbrechnungItem {
  _id: string;
  /** "TT.MM.JJJJ" */
  date: string;
  street: string;
  customerName: string;
  product: string;
  /** Provision laut App */
  amountSystem: number;
  /** Betrag laut Abrechnung */
  amountPdf: number;
  status: ItemStatus;
  reklamiert: boolean;
  reklamationReason?: string;
  reklamationNote?: string;
  reklamationDate?: string;
  reklamationResolved?: boolean;
  webOrderId?: string;
  customerNumber?: string;
  contractNumber?: string;
  zipCode?: string;
  city?: string;
  crossMonthMatched?: boolean;
  /** Hier verkauft, mit einer späteren Abrechnung ausgezahlt (Monat 0–11) */
  paidInMonth?: number;
  paidInYear?: number;
  /** Hier ausgezahlt, in einem früheren Monat verkauft */
  soldInMonth?: number;
  soldInYear?: number;
  /** Nur bei offenen Punkten aus /unresolved/all */
  recordId?: string;
  billingMonth?: number;
  billingYear?: number;
}

export interface AbrechnungRecord {
  _id: string;
  /** 0–11 wie Date.getMonth() */
  month: number;
  year: number;
  category?: AbrechnungCategory;
  pdfFileName?: string;
  totalAmountPdf: number;
  totalAmountSystem: number;
  differenceAmount: number;
  status: RecordStatus;
  items: AbrechnungItem[];
}

/** Ergebnis eines Uploads: der Server liest den Monat aus den Daten der Datei, er kann also wechseln. */
export interface UploadResult {
  record: AbrechnungRecord;
  parsedItemCount: number;
}

export interface MonthRef {
  month: number;
  year: number;
}

/** Ergebnis einer Aktion auf mehreren Positionen. */
export interface BulkResult {
  failed: number;
  total: number;
}
