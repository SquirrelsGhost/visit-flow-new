/** Die Vodafone-Formulare aus v1 (FormularDialog). */
export type FormId = "aenderung" | "uebernahme";

/** Bereiche der Änderungsmitteilung; jeder hat ein Kästchen im PDF. */
export type ChangeArea = "name" | "address" | "contact" | "bank" | "tax" | "other";

/** Anrede im Dropdown der Änderungsmitteilung (Werte genau wie im PDF). */
export type ChangeSalutation = "" | "Herr" | "Frau" | "Keine Angabe";

/** Änderungsmitteilung der Beraterin / des Beraters an Vodafone (VPKN, neue Stammdaten). */
export interface ChangeData {
  vpkn: string;
  firstName: string;
  lastName: string;
  areas: ChangeArea[];
  salutation: ChangeSalutation;
  company: string;
  newFirstName: string;
  newLastName: string;
  street: string;
  zipCity: string;
  phone: string;
  mobile: string;
  email: string;
  accountHolder: string;
  iban: string;
  bic: string;
  bank: string;
  taxOffice: string;
  taxNumber: string;
  vatId: string;
  otherText: string;
}

/** Anrede auf der Vertragsübernahme (Reihenfolge der Kästchen im PDF). */
export type TakeoverSalutation = "" | "Frau" | "Herr" | "Divers" | "Firma";

/** Übernahme zum Ende der Mindestlaufzeit oder zu einem Wunschtermin. */
export type TakeoverTiming = "asap" | "date";

/** Name und Anschrift einer Vertragspartei. */
export interface TakeoverParty {
  name: string;
  firstName: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
}

/** Vertragsübernahme Vodafone TV und Festnetz Kabel (bisheriger auf zukünftigen Vertragspartner). */
export interface TakeoverData {
  customerNumber: string;
  previous: TakeoverParty;
  deceased: boolean;
  previousSignature: string | null;
  next: TakeoverParty;
  salutation: TakeoverSalutation;
  birthYear: string;
  phone: string;
  email: string;
  timing: TakeoverTiming;
  /** ISO-Datum (yyyy-mm-dd) aus dem Datumsfeld. */
  date: string;
  bankHolder: string;
  iban: string;
  bic: string;
  nextSignature: string | null;
}
